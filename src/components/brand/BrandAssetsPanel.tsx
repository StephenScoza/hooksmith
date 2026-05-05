import { Download } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { HooksmithMark } from './HooksmithMark';
import { Button, Panel, PanelHeader, SmallBadge } from '../ui/FormControls';

const assets = [
  {
    name: 'App icon',
    description: 'Square SVG mark for favicon, app shells, and tiles.',
    href: '/hooksmith-icon.svg'
  },
  {
    name: 'Wordmark',
    description: 'Horizontal SVG lockup for headers, docs, and social cards.',
    href: '/hooksmith-wordmark.svg'
  }
];

export function BrandAssetsPanel() {
  return (
    <Panel>
      <PanelHeader
        eyebrow="Brand"
        title="Hooksmith assets"
        description="Use the same core mark and wordmark across product surfaces, docs, and launch materials."
        action={<SmallBadge>SVG assets</SmallBadge>}
      />

      <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
          <div className="mb-5 rounded-[1.5rem] bg-[#F3F4F6] p-4">
            <div className="mb-4 flex justify-center">
              <HooksmithMark className="h-20 w-20" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <BrandLogo size="sm" showTagline />
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-[#111827] p-4">
            <BrandLogo size="sm" showTagline />
          </div>
        </div>

        <div className="space-y-4">
          {assets.map((asset) => (
            <div key={asset.name} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{asset.name}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{asset.description}</p>
                </div>
                <a href={asset.href} download className="inline-flex">
                  <Button variant="secondary">
                    <Download className="h-4 w-4" />
                    Download SVG
                  </Button>
                </a>
              </div>
            </div>
          ))}

          <div className="rounded-[1.5rem] border border-orange-400/20 bg-orange-400/5 p-4 text-sm leading-6 text-orange-50/85">
            Keep the primary palette anchored to `#111827`, `#6B7280`, `#F3F4F6`, and `#F97316` so product UI and brand
            surfaces stay visually aligned.
          </div>
        </div>
      </div>
    </Panel>
  );
}
