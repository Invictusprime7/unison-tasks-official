import { describe, expect, it, vi } from 'vitest';
import { runCanonicalEnrichmentLane } from '../../supabase/functions/ai-code-assistant/canonicalEnrichmentLane';
const identity={version:'1.0',wizardSeedId:'seed',snapshotId:'snap',designRegistrySignature:'registry'};
const request={...identity,pageRegistry:[{filePath:'/src/pages/Home.tsx'}],currentPageSources:{home:{filePath:'/src/pages/Home.tsx',content:'export default function Home(){return <main/>}'}}};
const proposal={...identity,fileOps:[{type:'replace',path:'/src/pages/Home.tsx',content:'export default function Home(){return <main><h1>Studio</h1></main>}'}]};
describe('dedicated canonical enrichment lane',()=>{
 it('returns the exact proposal envelope without general source postprocessing',async()=>{
  const generate=vi.fn().mockResolvedValue({content:JSON.stringify(proposal),providerUsed:'openai'});
  const response=await runCanonicalEnrichmentLane(JSON.stringify(request),{},'Canonical instructions',generate);
  expect(response.status).toBe(200); const result=await response.json();expect(JSON.parse(result.content)).toEqual(proposal);expect(result.providerUsed).toBe('openai');
  expect(JSON.parse(generate.mock.calls[0][0][1].content)).toEqual(request);
 });
 it.each(['identity','path','duplicate','files'])('rejects %s violations before returning a proposal',async kind=>{
  const bad=structuredClone(proposal);if(kind==='identity')bad.snapshotId='other';if(kind==='path')bad.fileOps[0].path='/src/App.tsx';if(kind==='duplicate')bad.fileOps.push(bad.fileOps[0]);
  const result=await runCanonicalEnrichmentLane(JSON.stringify(request),{},'',async()=>({content:JSON.stringify(kind==='files'?{files:{}}:bad)}));expect(result.status).toBe(502);
 });
 it('rejects missing source before calling the provider',async()=>{
  const generate=vi.fn();const result=await runCanonicalEnrichmentLane(JSON.stringify({...request,currentPageSources:{}}),{},'',generate);expect(result.status).toBe(400);expect(generate).not.toHaveBeenCalled();
 });
 it('preserves provider HTTP errors for client diagnostics',async()=>{
  const result=await runCanonicalEnrichmentLane(JSON.stringify(request),{},'',async()=>({content:'',earlyError:{status:429,error:'Rate limited'}}));expect(result.status).toBe(429);expect(await result.json()).toMatchObject({errorType:'enrichment_provider'});
 });
});
