'use client';
/**
 * S3 3D 지식그래프 — 초기 30노드(대단원+성취기준), 점진 확장(성능 예산 200노드 이하),
 * 사이드 패널, 재구성 바구니, 검색, 2D 폴백.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildInitialGraph,
  expandStandard,
  expandLesson,
  activityNodeIds,
  searchNodeId,
  stdId,
  type GNode,
  type GLink,
} from '@/lib/data/graph';
import { ALL_STANDARD_CODES, lessonsForStandard } from '@/lib/data/standards';
import { GRAPH } from '@/lib/theme/tokens';
import * as THREE from 'three';
import { useBasket } from '@/lib/booth/basket';
import { publishBasket } from '@/lib/booth/publish';
import GraphSidePanel from '@/components/booth/GraphSidePanel';
import BasketTray from '@/components/booth/BasketTray';
import ListFallback from '@/components/booth/ListFallback';
import type { ContentId } from '@/lib/theme/tokens';

const NODE_BUDGET = 200;

// 위계별 지오메트리(모양) — 재사용 위해 모듈 레벨 1회 생성
const GEO: Record<string, THREE.BufferGeometry> = {
  unit: new THREE.BoxGeometry(11, 11, 11), // 대단원 = 정육면체
  standard: new THREE.OctahedronGeometry(6), // 성취기준 = 팔면체(다이아몬드)
  content: new THREE.CylinderGeometry(5, 5, 8, 20), // 콘텐츠 = 원기둥
  lesson: new THREE.ConeGeometry(5, 9, 4), // 차시 = 사각뿔(피라미드)
  activity: new THREE.SphereGeometry(2.6, 14, 14), // 세부활동 = 작은 구
};
function geometryFor(kind: string): THREE.BufferGeometry {
  return GEO[kind] ?? GEO.activity;
}

function linkKey(l: GLink) {
  return `${l.source}->${l.target}:${l.kind}`;
}
function endId(v: any): string {
  return typeof v === 'object' && v !== null ? v.id : v;
}

export default function KnowledgeGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const nodesRef = useRef<Map<string, GNode>>(new Map());
  const linksRef = useRef<Map<string, GLink>>(new Map());
  const lessonOrderRef = useRef<string[]>([]);
  const [selected, setSelected] = useState<GNode | null>(null);
  const [view, setView] = useState<'3d' | '2d'>('3d');
  const [query, setQuery] = useState('');
  const basket = useBasket();

  const apply = useCallback(() => {
    graphRef.current?.graphData({
      nodes: [...nodesRef.current.values()],
      links: [...linksRef.current.values()],
    });
  }, []);

  const merge = useCallback((patch: { nodes: GNode[]; links: GLink[] }) => {
    patch.nodes.forEach((n) => {
      if (!nodesRef.current.has(n.id)) nodesRef.current.set(n.id, n);
    });
    patch.links.forEach((l) => {
      const k = linkKey(l);
      if (!linksRef.current.has(k)) linksRef.current.set(k, l);
    });
  }, []);

  const collapseLesson = useCallback((lessonNodeId: string) => {
    // lesson:cid-no
    const rest = lessonNodeId.slice('lesson:'.length);
    const idx = rest.lastIndexOf('-');
    const cid = rest.slice(0, idx) as ContentId;
    const lessonNo = Number(rest.slice(idx + 1));
    const ids = new Set(activityNodeIds(cid, lessonNo));
    ids.forEach((id) => nodesRef.current.delete(id));
    linksRef.current.forEach((l, k) => {
      if (ids.has(endId(l.source)) || ids.has(endId(l.target))) linksRef.current.delete(k);
    });
  }, []);

  const enforceBudget = useCallback(
    (keepLessonId: string) => {
      while (nodesRef.current.size > NODE_BUDGET && lessonOrderRef.current.length > 1) {
        const oldest = lessonOrderRef.current[0];
        if (oldest === keepLessonId) break;
        lessonOrderRef.current.shift();
        collapseLesson(oldest);
      }
    },
    [collapseLesson],
  );

  const focus = useCallback((node: any) => {
    const g = graphRef.current;
    if (!g || node?.x === undefined) return;
    const dist = 120;
    const r = 1 + dist / Math.hypot(node.x, node.y, node.z || 1);
    g.cameraPosition({ x: node.x * r, y: node.y * r, z: (node.z || 0) * r }, node, 700);
  }, []);

  const handleNode = useCallback(
    (node: GNode) => {
      setSelected(node);
      if (node.kind === 'standard') {
        merge(expandStandard(node.meta.code as string));
        apply();
      } else if (node.kind === 'lesson') {
        const cid = node.meta.contentId as ContentId;
        const lessonNo = node.meta.lessonNo as number;
        merge(expandLesson(cid, lessonNo));
        if (!lessonOrderRef.current.includes(node.id)) lessonOrderRef.current.push(node.id);
        enforceBudget(node.id);
        apply();
      }
      focus(node as any);
    },
    [merge, apply, enforceBudget, focus],
  );

  // 사이드 패널 항목 클릭 → 해당 노드 클릭 효과(확장 + 카메라 확대)
  const focusNodeById = useCallback(
    (id: string) => {
      const node = nodesRef.current.get(id);
      if (node) handleNode(node);
    },
    [handleNode],
  );

  // 바구니 담기 시 해당 활동 노드 버스트(확대 + 초록 발광 플래시)
  const burstNode = useCallback((id: string) => {
    const g = graphRef.current;
    if (!g) return;
    const node = g.graphData().nodes.find((n: any) => n.id === id);
    const mesh: THREE.Mesh | undefined = node?.__threeObj;
    if (!mesh) return;
    const mat = mesh.material as THREE.MeshLambertMaterial;
    const startColor = mat.emissive.clone();
    const startIntensity = mat.emissiveIntensity;
    const dur = 700;
    let start = -1;
    const step = (now: number) => {
      if (start < 0) start = now;
      const p = Math.min(1, (now - start) / dur);
      const s = 1 + 2.2 * Math.sin(p * Math.PI); // 1 → 3.2 → 1
      mesh.scale.setScalar(s);
      mat.emissive.set('#22c55e');
      mat.emissiveIntensity = (1 - p) * 1.2;
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        mesh.scale.setScalar(1);
        mat.emissive.copy(startColor);
        mat.emissiveIntensity = startIntensity;
      }
    };
    requestAnimationFrame(step);
  }, []);

  // 담기 = 바구니 추가 + 노드 버스트
  const addToBasket = useCallback(
    (item: Parameters<typeof basket.add>[0]) => {
      basket.add(item);
      burstNode(item.id);
    },
    [basket, burstNode],
  );

  // 실제 연계 콘텐츠가 있는 성취기준 노드(깜빡임 대상)
  const blinkIds = useMemo(
    () =>
      new Set(
        ALL_STANDARD_CODES.filter((c) => lessonsForStandard(c).length > 0).map((c) => stdId(c)),
      ),
    [],
  );

  // 3D 그래프 초기화
  useEffect(() => {
    if (view !== '3d' || !containerRef.current) return;
    let disposed = false;
    (async () => {
      const ForceGraph3D = (await import('3d-force-graph')).default;
      if (disposed || !containerRef.current) return;
      const el = containerRef.current;
      const g = new ForceGraph3D(el)
        .backgroundColor(GRAPH.bg)
        .width(el.clientWidth)
        .height(el.clientHeight)
        .nodeLabel((n: any) => `${n.label}`)
        .nodeThreeObject((n: any) => {
          const isBlink = n.kind === 'standard' && blinkIds.has(n.id);
          const mat = new THREE.MeshLambertMaterial({
            color: new THREE.Color(n.color),
            emissive: new THREE.Color(isBlink ? '#fde047' : '#000000'),
            emissiveIntensity: 0,
          });
          return new THREE.Mesh(geometryFor(n.kind), mat);
        })
        .linkColor((l: any) => (l.style === 'dashed' ? GRAPH.linkDashed : GRAPH.link))
        .linkWidth((l: any) => (l.instructor ? 1.6 : 0.6))
        .linkOpacity(0.5)
        .onNodeClick((n: any) => handleNode(n));
      graphRef.current = g;

      const init = buildInitialGraph();
      nodesRef.current = new Map(init.nodes.map((n) => [n.id, n]));
      linksRef.current = new Map(init.links.map((l) => [linkKey(l), l]));
      apply();

      const onResize = () => g.width(el.clientWidth).height(el.clientHeight);
      window.addEventListener('resize', onResize);
      (g as any).__onResize = onResize;

      // 연계 콘텐츠가 있는 성취기준 노드 깜빡임(발광·크기 펄스)
      let blinkOn = false;
      const blinkTimer = setInterval(() => {
        const gg = graphRef.current;
        if (!gg) return;
        blinkOn = !blinkOn;
        gg.graphData().nodes.forEach((n: any) => {
          if (n.kind === 'standard' && blinkIds.has(n.id) && n.__threeObj) {
            const mesh = n.__threeObj as THREE.Mesh;
            const mat = mesh.material as THREE.MeshLambertMaterial;
            mat.emissiveIntensity = blinkOn ? 0.9 : 0;
            mesh.scale.setScalar(blinkOn ? 1.35 : 1);
          }
        });
      }, 550);
      (g as any).__blink = blinkTimer;
    })();

    return () => {
      disposed = true;
      const g = graphRef.current;
      if (g) {
        if ((g as any).__onResize) window.removeEventListener('resize', (g as any).__onResize);
        if ((g as any).__blink) clearInterval((g as any).__blink);
        g._destructor?.();
        graphRef.current = null;
      }
    };
  }, [view, apply, handleNode, blinkIds]);

  // 검색: 성취기준 코드 / 활동 제목
  const runSearch = useCallback(() => {
    const id = searchNodeId(query);
    if (!id) return;
    if (id.startsWith('std:')) {
      const code = id.slice('std:'.length);
      merge(expandStandard(code));
      apply();
      const node = nodesRef.current.get(id);
      if (node) {
        setSelected(node);
        focus(node as any);
      }
    } else if (id.startsWith('act:')) {
      const rest = id.slice('act:'.length).split('-');
      const cid = rest[0] as ContentId;
      const lessonNo = Number(rest[1]);
      // 활동을 드러내기 위해 소속 차시의 성취기준을 확장 → 차시 → 활동
      import('@/lib/data/standards').then(({ lessonMapping }) => {
        const primary = lessonMapping(cid, lessonNo).primary[0];
        if (primary) merge(expandStandard(primary));
        merge(expandLesson(cid, lessonNo));
        if (!lessonOrderRef.current.includes(`lesson:${cid}-${lessonNo}`))
          lessonOrderRef.current.push(`lesson:${cid}-${lessonNo}`);
        apply();
        const node = nodesRef.current.get(id);
        if (node) {
          setSelected(node);
          focus(node as any);
        }
      });
    }
  }, [query, merge, apply, focus]);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 'var(--fs-2xl)' }}>3D 지식그래프</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runSearch();
          }}
          style={{ display: 'flex', gap: 'var(--space-2)' }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="성취기준 코드·활동 제목 검색"
            style={{
              padding: 'var(--space-2) var(--space-3)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--fs-sm)',
              minWidth: 220,
            }}
          />
          <button type="submit" style={btnStyle}>검색</button>
        </form>
        <button onClick={() => setView((v) => (v === '3d' ? '2d' : '3d'))} style={{ ...btnStyle, marginLeft: 'auto' }}>
          {view === '3d' ? '2D 목록 보기' : '3D 그래프 보기'}
        </button>
      </header>

      <p
        style={{
          fontSize: 'var(--fs-sm)',
          background: 'var(--theme-tint, var(--color-surface-2))',
          borderLeft: '3px solid var(--color-primary)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-2) var(--space-3)',
        }}
      >
        🔗 편의상 두 콘텐츠(<strong>도트밸리 속 버그를 잡아라</strong> + <strong>S.O.S 세계수를 구하라</strong>)를 한 그래프에 묶었습니다.
        덕분에 <strong>두 콘텐츠를 넘나들며</strong> 같은 성취기준의 활동을 골라 <strong>수업을 융합·재구성</strong>할 수 있습니다.
      </p>

      <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)', display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <span>대단원 5색 · 위계별 모양(대단원=정육면체·성취기준=팔면체·차시=피라미드·활동=구) · 실선=primary, 점선=secondary · 굵은 간선=강사 재구성안(도트밸리)</span>
      </p>

      {view === '3d' ? (
        <div className="graph-layout">
          <div
            ref={containerRef}
            style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              background: GRAPH.bg,
              height: '62vh',
              minHeight: 320,
            }}
          />
          <GraphSidePanel node={selected} onAdd={addToBasket} has={basket.has} onFocusNode={focusNodeById} />
        </div>
      ) : (
        <div className="graph-layout">
          <ListFallback onAdd={addToBasket} has={basket.has} />
          <GraphSidePanel node={selected} onAdd={addToBasket} has={basket.has} onFocusNode={focusNodeById} />
        </div>
      )}

      <BasketTray
        items={basket.items}
        onRemove={basket.remove}
        onClear={basket.clear}
        exportMarkdown={basket.exportMarkdown}
        onPublish={() => publishBasket(basket.items)}
      />
    </section>
  );
}

const btnStyle: React.CSSProperties = {
  padding: 'var(--space-2) var(--space-3)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  fontSize: 'var(--fs-sm)',
  fontWeight: 'var(--fw-medium)',
};
