'use client';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
export function ThemeToggle(){
  const [dark,setDark]=useState(true);
  useEffect(()=>{const saved=localStorage.getItem('blackstar-theme');const isDark=saved? saved==='dark' : true;setDark(isDark);document.documentElement.classList.toggle('light',!isDark)},[]);
  return <button aria-label="Toggle theme" onClick={()=>{const next=!dark;setDark(next);localStorage.setItem('blackstar-theme',next?'dark':'light');document.documentElement.classList.toggle('light',!next)}} className="icon-button">{dark?<Sun size={15}/>:<Moon size={15}/>}</button>
}
