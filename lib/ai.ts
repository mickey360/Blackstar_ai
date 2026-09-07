export async function aiGenerate({task,input,model}:{task:string;input:any;model?:string}){
 const token=process.env.HF_TOKEN;
 if(token){try{const r=await fetch(`https://api-inference.huggingface.co/models/${model||process.env.HF_MODEL||'Qwen/Qwen2.5-0.5B-Instruct'}`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({inputs:`Task: ${task}\nInput: ${JSON.stringify(input)}`,parameters:{max_new_tokens:256,return_full_text:false}})});if(r.ok){const j:any=await r.json();return Array.isArray(j)?j[0]?.generated_text||j:j;}}catch{}}
 const text=typeof input==='string'?input:JSON.stringify(input);
 if(task==='classify') return {label:text.toLowerCase().includes('urgent')?'urgent':'normal',confidence:0.72,provider:'local-heuristic'};
 if(task==='extract') return {text,entities:text.match(/#[\w-]+|@[\w-]+/g)||[],provider:'local-heuristic'};
 if(task==='summarize') return {summary:text.length>240?text.slice(0,237)+'...':text,provider:'local-heuristic'};
 return {result:text,provider:'local-heuristic'};
}
