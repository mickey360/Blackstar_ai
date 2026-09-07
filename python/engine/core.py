"""Pure-Python deterministic workflow primitives used by Blackstar."""
from statistics import mean

def numeric_stats(values):
    nums=[x for x in values if isinstance(x,(int,float)) and not isinstance(x,bool)]
    return {'count':len(nums),'min':min(nums) if nums else None,'max':max(nums) if nums else None,'mean':mean(nums) if nums else None}

def dedupe(values):
    out=[]; seen=set()
    for value in values:
        key=repr(value)
        if key not in seen: seen.add(key); out.append(value)
    return out
