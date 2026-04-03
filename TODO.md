# Website Performance Optimization - TODO

Status: 🔄 In Progress

## Approved Plan Steps:

### Phase 1: Critical Fixes (High Impact)
1. [✅] **SofaReveal.jsx**: Reduced 240→60 frames, WebP+JPEG fallback, IntersectionObserver viewport preload (20 init + idle rest), DPR≤1.5 responsive canvas, scrub=0.15, end='+=1500'
   - Expected: ↓75% memory, <1s load

2. [ ] **app/page.tsx**: Sequential Product3D loading (sofa first, then scroll-trigger others via useInView), wrap in Suspense
   - Expected: Load 1 GLB at a time vs 4 parallel

3. [ ] **Hero.jsx**: Disable RAF mousemove on mobile/low-perf, CSS-only orb hover, confirm 50ms throttle
   - Expected: 60fps hover/scroll

### Phase 2: 3D & Canvas Opts
4. [ ] **Product3D.jsx**: Add useInView for model load trigger, unload siblings
5. [ ] **ModelViewer.jsx**: dpr=[1,1.2], frameloop='demand', antialias=false (enhance), low-poly LOD if possible

### Phase 3: Config & Global
6. [ ] **next.config.ts**: swcMinify:true, more cache opts
7. [ ] **Verify images**: Ensure next/image everywhere w/ sizes

### Phase 4: Validation
8. [ ] Run `npm run build && npm run start`
9. [ ] Lighthouse audit (desktop/mobile), target 95+ perf
10. [ ] Update PERFORMANCE_OPTIMIZATION_GUIDE.md
11. [ ] Test all pages (home, products, customization, admin)

**Next Step:** Implement Phase 1 #1 - SofaReveal.jsx

