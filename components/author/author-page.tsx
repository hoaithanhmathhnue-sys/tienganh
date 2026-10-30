import Image from 'next/image';
import { Building2, Mail, MessageCircle, Phone, type LucideIcon } from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { AUTHOR, AUTHOR_ZALO_URL, formatPhone } from '@/lib/author';

const CONTACTS: { label: string; value: string; icon: LucideIcon; href?: string }[] = [
  { label: 'Email', value: AUTHOR.email, icon: Mail, href: `mailto:${AUTHOR.email}` },
  { label: 'Điện thoại', value: formatPhone(AUTHOR.phone), icon: Phone, href: `tel:${AUTHOR.phone}` },
  { label: 'Zalo', value: formatPhone(AUTHOR.phone), icon: MessageCircle, href: AUTHOR_ZALO_URL },
  { label: 'Đơn vị', value: `${AUTHOR.school}, ${AUTHOR.address}`, icon: Building2 },
];

/** Trang giới thiệu tác giả và thông tin liên hệ. */
export function AuthorPage() {
  return (
    <>
      <main className="mx-auto max-w-[1200px] px-4 py-10 sm:py-14">
        <section className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="flex flex-col items-center gap-4 bg-[#004D40] px-6 py-8 text-center text-white sm:flex-row sm:text-left">
            <span className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-white/15 ring-4 ring-white/30 sm:h-32 sm:w-32">
              <Image src={AUTHOR.avatar} alt={`Ảnh ${AUTHOR.role.toLowerCase()} ${AUTHOR.name}`} fill sizes="128px" priority className="object-cover" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-teal-200">Tác giả</p>
              <h1 className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">{AUTHOR.name}</h1>
              <p className="mt-1 text-sm text-white/85">
                {AUTHOR.role} — {AUTHOR.school}
              </p>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Thông tin liên hệ</h2>
            <ul className="mt-4 grid gap-3">
              {CONTACTS.map(({ label, value, icon: Icon, href }) => {
                const body = (
                  <>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#00796B] dark:bg-teal-500/15 dark:text-teal-300">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold text-muted-foreground">{label}</span>
                      <span className="block break-words font-bold text-foreground">{value}</span>
                    </span>
                  </>
                );
                const className = 'flex items-center gap-3 rounded-2xl border border-border p-3';
                return (
                  <li key={label}>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className={`${className} transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00897B]`}
                      >
                        {body}
                      </a>
                    ) : (
                      <div className={className}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
