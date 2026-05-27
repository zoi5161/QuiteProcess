import { useState } from 'react'
import { ExternalLink, Database } from 'lucide-react'

interface Props {
  onSave: (url: string, key: string) => void
}

export default function SetupPage({ onSave }: Props) {
  const [url, setUrl] = useState('')
  const [key, setKey] = useState('')

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0f1117' }}>
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#7c6ef720', border: '1px solid #7c6ef740' }}>
            <Database size={20} style={{ color: '#7c6ef7' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Connect Supabase</h1>
            <p className="text-sm text-slate-400">One-time setup to store your data</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl flex flex-col gap-4" style={{ background: '#1a1d2e', border: '1px solid #2d3148' }}>
          <div className="p-3 rounded-lg text-sm text-slate-300 flex flex-col gap-2" style={{ background: '#12141f', border: '1px solid #2d3148' }}>
            <p className="font-semibold text-slate-200">Steps to get your keys:</p>
            <ol className="list-decimal list-inside text-slate-400 text-xs space-y-1">
              <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener" className="text-purple-400 underline">supabase.com</a> and create a free account</li>
              <li>Create a new project</li>
              <li>Go to <strong>Settings → API</strong></li>
              <li>Copy <strong>Project URL</strong> and <strong>anon/public key</strong></li>
              <li>Go to <strong>SQL Editor</strong> and run the SQL below</li>
            </ol>
          </div>

          <details className="text-xs">
            <summary className="text-slate-400 cursor-pointer hover:text-slate-200 font-semibold">
              View SQL schema to run in Supabase
            </summary>
            <pre className="mt-2 p-3 rounded-lg text-slate-300 overflow-x-auto" style={{ background: '#12141f', border: '1px solid #2d3148', fontSize: 10, lineHeight: 1.6 }}>
{`create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  completed boolean default false,
  color text,
  created_at timestamptz default now()
);

create table habits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text default '⭐',
  color text default '#7c6ef7',
  created_at timestamptz default now()
);

create table habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references habits(id) on delete cascade,
  date date not null,
  completed boolean default false,
  unique(habit_id, date)
);

create table mindset_logs (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  energy int default 5,
  focus int default 5,
  motivation int default 5,
  mood int default 5,
  notes text
);

-- Enable Row Level Security (optional but recommended)
alter table tasks enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table mindset_logs enable row level security;

-- Allow all for anon key (no auth)
create policy "public access" on tasks for all using (true);
create policy "public access" on habits for all using (true);
create policy "public access" on habit_logs for all using (true);
create policy "public access" on mindset_logs for all using (true);`}
            </pre>
          </details>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Project URL</label>
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://xxxxxxxxxxxx.supabase.co"
                className="w-full text-sm bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Anon/Public Key</label>
              <input
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full text-sm bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none"
              />
            </div>
          </div>

          <button
            onClick={() => { if (url && key) onSave(url.trim(), key.trim()) }}
            disabled={!url || !key}
            className="w-full py-2.5 rounded-lg font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #7c6ef7, #4ecdc4)' }}
          >
            Connect & Continue
          </button>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4 flex items-center justify-center gap-1">
          <ExternalLink size={11} /> Keys are saved in your browser's localStorage
        </p>
      </div>
    </div>
  )
}
