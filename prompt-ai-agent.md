# PROMPT_AI_AGENT — RERAISE CLUB

## Контекст проекта

RERAISE CLUB — приложение для покерного клуба (Telegram Mini App + веб-версия). Полноценный PRD находится в файле `PRD-ReraiseClub.md`. Этот файл — стартовая точка для AI-агента, продолжающего разработку.

**Стек:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + **shadcn/ui (обязательно для всех UI-компонентов)**
- Prisma + SQLite (dev) / PostgreSQL (prod)
- NextAuth.js v5 (Telegram + Email OTP)
- Telegram Web App SDK
- Recharts (графики)
- Resend / SMTP (email)
- Хостинг: VDS + Docker + GitHub Actions

**Архитектура — Feature-Sliced Design (FSD) обязательно:**

Проект разбивается на слои согласно методологии FSD. Структура папок:

```
src/
├── app/                    # Next.js App Router (routing + providers)
│   ├── (auth)/
│   ├── (main)/
│   │   ├── page.tsx       # Главная
│   │   ├── calendar/
│   │   ├── rating/
│   │   ├── profile/
│   │   └── tournament/[id]/
│   ├── admin/
│   ├── api/
│   ├── layout.tsx
│   └── providers.tsx
├── pages/                  # Композиция виджетов в страницы (НЕ Next.js pages)
│   ├── home/
│   ├── calendar/
│   ├── rating/
│   ├── profile/
│   └── tournament-detail/
├── widgets/                # Самостоятельные блоки UI
│   ├── tournament-list/
│   ├── friends-feed/
│   ├── rating-podium/
│   ├── rating-table/
│   ├── achievements-grid/
│   ├── referral-card/
│   ├── rating-chart/
│   ├── bottom-nav/
│   └── header/
├── features/               # Действия пользователя
│   ├── tournament-register/
│   ├── tournament-cancel/
│   ├── follow-user/
│   ├── share-referral/
│   ├── bind-email/
│   ├── change-nickname/
│   └── filter-tournaments/
├── entities/               # Бизнес-сущности
│   ├── user/
│   │   ├── model/         # types, schemas, store
│   │   ├── api/           # API queries
│   │   └── ui/            # UserAvatar, UserCard
│   ├── tournament/
│   ├── registration/
│   ├── achievement/
│   ├── season/
│   └── rating/
└── shared/                 # Переиспользуемое без бизнес-логики
    ├── ui/                # shadcn-обёртки и кастомные UI (Button, Card, Badge)
    ├── lib/               # утилиты, helpers
    ├── api/               # базовый API-клиент, prisma client
    ├── config/            # константы, env
    └── types/             # глобальные типы
```

**Правила FSD:**
- Слои сверху вниз: `app → pages → widgets → features → entities → shared`
- Импорты только сверху вниз: `widget` может импортить `feature/entity/shared`, но не наоборот
- Внутри слайса публичный API экспортируется через `index.ts`
- Не импортировать напрямую из внутренностей слайса (`widgets/tournament-list/ui/Card.tsx` ❌, `widgets/tournament-list` ✅)
- Каждый слайс содержит подпапки: `ui/`, `model/`, `api/`, `lib/` (по необходимости)

**shadcn/ui:**
- Все базовые UI-элементы (Button, Card, Dialog, Sheet, Tabs, Input, Select, Toast, Skeleton, Avatar, Badge, Progress, Separator, Drawer, ScrollArea) берутся из shadcn/ui
- Установка через CLI: `npx shadcn@latest add <component>`
- Кастомизация через Tailwind-классы и `cn()` хелпер
- В `shared/ui/` лежат либо чистые shadcn-компоненты, либо тонкие обёртки над ними под дизайн RERAISE CLUB
- Не писать свои Button/Dialog/Card с нуля — использовать shadcn как базу
- Темизация через CSS-переменные shadcn в `app/globals.css` под бордово-золотую палитру

**Дизайн-система:**
- Палитра: бордовый фон `#1a0a0c` / `#0f0608`, золотые акценты `amber-400/500/600`, розовые акценты `rose-700/900`
- Шрифт: system-ui
- Логотип: монограмма R в золотом квадрате, надпись `RAISE CLUB` / `RERAISE CLUB` уставным шрифтом
- Карточки: gradient `from-[#3a1a1f] to-[#2a1014]` с border `amber-900/20`
- CTA-кнопки: gradient `from-amber-500 to-amber-400`, чёрный текст
- Bottom navigation: плавающая, `bottom-3`, `rounded-2xl`, `backdrop-blur-lg`

---

## Полный код референсного UI-прототипа

```jsx
import { useState } from 'react';
import { Home, Calendar, Trophy, User, ChevronDown, Users, Clock, ChevronLeft, Search, Layers, MapPin, Zap, Award, TrendingUp, Share2, Gift, ChevronRight, Sparkles, Target, Flame, Crown, Medal } from 'lucide-react';

export default function ReraiseClub() {
  const [activeTab, setActiveTab] = useState('home');
  const [showStructure, setShowStructure] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [ratingFilter, setRatingFilter] = useState('global');
  const [calendarFilter, setCalendarFilter] = useState('all');

  const tournaments = [
    { id: 1, name: 'Ultra Bounty', type: 'bounty', seats: 56, maxSeats: 60, time: '17:00', date: '2026-05-03', day: 'Воскресенье', season: 'Майский сезон', stack: 30000, ticket: 1500, guarantee: 90000 },
    { id: 2, name: 'No raise', type: 'no_raise', seats: 27, maxSeats: 60, time: '19:00', date: '2026-05-04', day: 'Понедельник', season: 'Майский сезон', stack: 25000, ticket: 1000 },
    { id: 3, name: 'Amateur tournament', type: 'amateur', seats: 6, maxSeats: 40, time: '19:00', date: '2026-05-05', day: 'Вторник', season: 'Майский сезон', stack: 20000, ticket: 800 },
    { id: 4, name: 'Freezeout Classic', type: 'freezeout', seats: 22, maxSeats: 50, time: '20:00', date: '2026-05-06', day: 'Среда', season: 'Майский сезон', stack: 35000, ticket: 1200 },
  ];

  const ratingData = [
    { pos: 1, name: 'V', bounties: 61, points: 31045, change: 0 },
    { pos: 2, name: 'ИзЯ', bounties: 112, points: 30414, change: 1 },
    { pos: 3, name: 'VagabOnd', bounties: 72, points: 28445, change: -1 },
    { pos: 4, name: 's1eepz', bounties: 88, points: 26200, change: 2 },
    { pos: 5, name: 'Олег Вла', bounties: 110, points: 23981, change: 0 },
    { pos: 6, name: 'SkyDiver', bounties: 45, points: 22100, change: 3 },
    { pos: 7, name: 'Baber', bounties: 67, points: 21500, change: -2 },
  ];

  const friendsFeed = [
    { user: 'VagabOnd', action: 'занял 2-е место', tournament: 'Ultra Bounty', time: '2 часа назад', avatar: 'V' },
    { user: 'ИзЯ', action: 'выиграл', tournament: 'No raise', time: '1 день назад', avatar: 'И' },
    { user: 's1eepz', action: 'разблокировал', achievement: 'Royal Flush', time: '2 дня назад', avatar: 'S' },
  ];

  const achievements = [
    { id: 1, code: 'royal_flush', icon: '🃏', title: 'Royal Flush', desc: 'Собрал роял-флеш', category: 'rare', unlocked: true, date: '2026-04-28' },
    { id: 2, code: 'iron_man', icon: '📅', title: 'Iron Man', desc: '10 турниров подряд', category: 'rare', unlocked: true, date: '2026-04-15' },
    { id: 3, code: 'first_win', icon: '🥇', title: 'First Win', desc: 'Первая победа', category: 'result', unlocked: true, date: '2026-03-20' },
    { id: 4, code: 'champion_5', icon: '🏆', title: 'Champion ×5', desc: '5 побед в турнирах', category: 'result', unlocked: true, date: '2026-04-22' },
    { id: 5, code: 'regular', icon: '🎲', title: 'Regular', desc: '10 турниров', category: 'participation', unlocked: true, date: '2026-03-15' },
    { id: 6, code: 'veteran', icon: '🎲', title: 'Veteran', desc: '50 турниров', category: 'participation', unlocked: false },
    { id: 7, code: 'season_sweep', icon: '🏆', title: 'Season Sweep', desc: 'Все турниры сезона', category: 'rare', unlocked: false },
    { id: 8, code: 'lightning', icon: '⚡', title: 'Lightning', desc: '5+ выбитых в одной раздаче', category: 'rare', unlocked: false },
  ];

  const tournamentTypes = {
    bounty: { label: 'Bounty', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    no_raise: { label: 'No raise', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    amateur: { label: 'Amateur', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    freezeout: { label: 'Freezeout', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  };

  const blindStructure = [
    { lvl: 1, sb: 100, bb: 200, ante: 0, dur: 20 },
    { lvl: 2, sb: 200, bb: 400, ante: 50, dur: 20 },
    { lvl: 3, sb: 300, bb: 600, ante: 75, dur: 20 },
    { lvl: 4, sb: 500, bb: 1000, ante: 100, dur: 20 },
    { lvl: 5, sb: 0, bb: 0, ante: 0, dur: 10, isBreak: true },
    { lvl: 6, sb: 800, bb: 1600, ante: 200, dur: 20 },
    { lvl: 7, sb: 1200, bb: 2400, ante: 300, dur: 20 },
  ];

  const Logo = ({ size = 'md' }) => {
    const sizes = { sm: 'w-8 h-8 text-base', md: 'w-12 h-12 text-xl', lg: 'w-16 h-16 text-2xl' };
    return (
      <div className={`${sizes[size]} flex items-center justify-center rounded-lg bg-gradient-to-br from-amber-700/40 to-amber-900/40 border border-amber-600/30`}>
        <span className="font-serif text-amber-200">R</span>
      </div>
    );
  };

  const Header = ({ title, showBack = false, onBack }) => (
    <div className="px-4 pt-6 pb-4 sticky top-0 z-20" style={{ background: 'linear-gradient(180deg, #1a0a0c 70%, transparent 100%)' }}>
      <div className="flex items-center gap-3 mb-4">
        <Logo size="sm" />
        <span className="font-serif text-amber-200/90 text-lg tracking-widest">RERAISE CLUB</span>
      </div>
      {title && (
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={onBack} className="w-10 h-10 rounded-full bg-[#2a1518] border border-amber-900/30 flex items-center justify-center active:scale-95 transition">
              <ChevronLeft className="w-5 h-5 text-amber-200" />
            </button>
          )}
          <h1 className="text-2xl font-bold text-white">{title}</h1>
        </div>
      )}
    </div>
  );

  const TournamentTypeBadge = ({ type }) => {
    const t = tournamentTypes[type];
    return <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${t.color}`}>{t.label}</span>;
  };

  const ProgressBar = ({ value, max }) => {
    const pct = (value / max) * 100;
    return (
      <div className="w-full h-1.5 rounded-full bg-[#1a0a0c] overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    );
  };

  const TournamentCard = ({ t, compact = false, onClick }) => (
    <button onClick={onClick} className="w-full text-left rounded-2xl bg-gradient-to-br from-[#3a1a1f] to-[#2a1014] border border-amber-900/20 p-4 active:scale-[0.98] transition shadow-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg mb-1">{t.name}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <TournamentTypeBadge type={t.type} />
            <span className="text-xs text-amber-200/60">{t.season}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-amber-200 font-bold text-lg">{t.time}</div>
          <div className="text-xs text-amber-200/50">{t.day}</div>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-2 text-sm">
        <div className="flex items-center gap-1.5 text-amber-100/80">
          <Users className="w-4 h-4" />
          <span className="font-medium">{t.seats}/{t.maxSeats}</span>
        </div>
        <div className="text-amber-100/50 text-xs">{t.date}</div>
      </div>
      <ProgressBar value={t.seats} max={t.maxSeats} />
    </button>
  );

  // ============ HOME SCREEN ============
  const HomeScreen = () => (
    <div className="pb-28">
      <Header />
      <div className="px-4 space-y-6">
        {/* My Registrations */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-amber-500 rounded-full" />
            <h2 className="text-white font-bold text-lg">Мои записи</h2>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-amber-900/20 to-rose-900/20 border border-amber-700/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-amber-200 font-bold">Ultra Bounty</div>
                <div className="text-xs text-amber-200/60 mt-0.5">Вс, 03.05 в 17:00</div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
                Записан
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Tournaments */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-white font-bold text-lg">Ближайшие турниры</h2>
          </div>
          <div className="space-y-3">
            {tournaments.slice(0, 3).map(t => (
              <TournamentCard key={t.id} t={t} onClick={() => setSelectedTournament(t)} />
            ))}
          </div>
        </section>

        {/* Friends Feed */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-amber-400" />
            <h2 className="text-white font-bold text-lg">Лента друзей</h2>
          </div>
          <div className="space-y-2">
            {friendsFeed.map((f, i) => (
              <div key={i} className="rounded-xl bg-[#2a1014]/80 border border-amber-900/20 p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-700 to-rose-900 flex items-center justify-center text-white font-bold">
                  {f.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm">
                    <span className="font-bold">{f.user}</span>{' '}
                    <span className="text-amber-100/70">{f.action}</span>{' '}
                    <span className="text-amber-300">{f.tournament || f.achievement}</span>
                  </div>
                  <div className="text-xs text-amber-200/40 mt-0.5">{f.time}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top 3 Preview */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-amber-400" />
            <h2 className="text-white font-bold text-lg">Топ рейтинга</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {ratingData.slice(0, 3).map((p, i) => {
              const medals = ['🥇', '🥈', '🥉'];
              const heights = ['pt-2', 'pt-6', 'pt-8'];
              const order = [1, 0, 2];
              const player = ratingData[order[i]];
              return (
                <div key={i} className={`rounded-xl bg-gradient-to-b from-amber-900/30 to-[#2a1014] border border-amber-700/30 p-3 text-center ${heights[i]}`}>
                  <div className="text-2xl mb-1">{medals[order[i]]}</div>
                  <div className="text-white font-bold text-sm truncate">{player.name}</div>
                  <div className="text-amber-300 text-xs font-medium mt-1">{player.points.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Club Stats */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h2 className="text-white font-bold text-lg">Клуб в цифрах</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-[#3a1a1f] to-[#2a1014] border border-amber-900/20 p-4">
              <div className="text-3xl font-bold text-white">2535</div>
              <div className="text-xs text-amber-200/60 uppercase tracking-wider mt-1">Игроков</div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-[#3a1a1f] to-[#2a1014] border border-amber-900/20 p-4">
              <div className="text-3xl font-bold text-white">55</div>
              <div className="text-xs text-amber-200/60 uppercase tracking-wider mt-1">Турниров</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  // ============ TOURNAMENT DETAIL ============
  const TournamentDetail = ({ t }) => (
    <div className="pb-44">
      <Header title="Событие" showBack onBack={() => setSelectedTournament(null)} />
      <div className="px-4 space-y-4">
        {/* Main Info */}
        <div className="rounded-2xl bg-gradient-to-br from-[#3a1a1f] to-[#2a1014] border border-amber-900/30 p-5">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-white font-bold text-2xl">{t.name}</h2>
            <TournamentTypeBadge type={t.type} />
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-amber-900/20">
              <span className="text-amber-200/60 uppercase text-xs tracking-wider">Место</span>
              <span className="text-white text-right max-w-[60%]">Кожевенная линия, 30, Лофт Brosko</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-amber-900/20">
              <span className="text-amber-200/60 uppercase text-xs tracking-wider">Время</span>
              <span className="text-white">{t.date} / {t.time}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-amber-900/20">
              <span className="text-amber-200/60 uppercase text-xs tracking-wider">Места</span>
              <span className="text-white font-bold">{t.seats}/{t.maxSeats}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-amber-900/20">
              <span className="text-amber-200/60 uppercase text-xs tracking-wider">Стартовый стек</span>
              <span className="text-white font-bold">{t.stack.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-amber-200/60 uppercase text-xs tracking-wider">Билет</span>
              <span className="text-amber-300 font-bold">{t.ticket}₽</span>
            </div>
          </div>
        </div>

        {/* Format */}
        <div className="rounded-2xl bg-[#2a1014]/80 border border-amber-900/20 p-5">
          <h3 className="text-white font-bold text-lg mb-3">Формат турнира</h3>
          <p className="text-amber-100/80 text-sm leading-relaxed">
            Баунти турнир, где каждый нокаут приносит ULTRA-баунти.<br />
            <span className="text-amber-300 font-medium">ULTRA баунти = 150 очкам</span>
          </p>
        </div>

        {/* Structure (collapsible) */}
        <button
          onClick={() => setShowStructure(!showStructure)}
          className="w-full rounded-2xl bg-[#2a1014]/80 border border-amber-900/20 p-4 active:scale-[0.99] transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span className="text-white font-bold">Структура турнира</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-amber-400 transition-transform ${showStructure ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {showStructure && (
          <div className="rounded-2xl bg-[#2a1014]/80 border border-amber-900/20 p-4 -mt-2 animate-in fade-in slide-in-from-top-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-amber-200/60 text-xs uppercase tracking-wider border-b border-amber-900/20">
                    <th className="text-left py-2 font-medium">Уровень</th>
                    <th className="text-right py-2 font-medium">SB / BB</th>
                    <th className="text-right py-2 font-medium">Ante</th>
                    <th className="text-right py-2 font-medium">Время</th>
                  </tr>
                </thead>
                <tbody>
                  {blindStructure.map((b, i) => (
                    <tr key={i} className={`border-b border-amber-900/10 ${b.isBreak ? 'bg-amber-900/10' : ''}`}>
                      <td className="py-2.5 text-white font-medium">{b.isBreak ? '☕ Перерыв' : `Lvl ${b.lvl}`}</td>
                      <td className="text-right text-amber-100">{b.isBreak ? '—' : `${b.sb}/${b.bb}`}</td>
                      <td className="text-right text-amber-100/70">{b.isBreak ? '—' : b.ante || '—'}</td>
                      <td className="text-right text-amber-200/60">{b.dur} мин</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Important */}
        <div className="rounded-2xl bg-gradient-to-br from-rose-900/30 to-rose-950/30 border border-rose-700/30 p-5">
          <h3 className="text-rose-300 font-bold mb-3 flex items-center gap-2">
            <Flame className="w-5 h-5" /> Важно
          </h3>
          <p className="text-amber-100/80 text-sm leading-relaxed">
            Пожалуйста, отменяйте участие заранее, если понимаете, что не сможете прийти.
            Неявка без предупреждения блокирует место для игроков из листа ожидания.
          </p>
        </div>

        {/* Participants */}
        <div className="rounded-2xl bg-[#2a1014]/80 border border-amber-900/20 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg">Участники</h3>
            <span className="text-emerald-400 text-sm font-medium">✓ Свободно {t.maxSeats - t.seats} мест</span>
          </div>
          <div className="space-y-2">
            {['SkyDiver', 'Baber', '€$ LP', 'Dmitry_archmeb', 'Omarello57', 'Feeleemon'].map((name, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-900/10 transition">
                <span className="text-amber-200/40 w-6 text-sm font-medium">{i + 1}</span>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-700 to-rose-900 flex items-center justify-center text-white font-bold text-sm">
                  {name[0]}
                </div>
                <span className="text-white font-medium">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Invite */}
        <button className="w-full rounded-2xl bg-[#2a1014]/80 border border-amber-900/20 p-4 active:scale-[0.99] transition flex items-center justify-center gap-2">
          <Share2 className="w-5 h-5 text-amber-400" />
          <span className="text-white font-medium">Пригласить друзей</span>
        </button>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-24 left-0 right-0 px-4 z-30 max-w-md mx-auto">
        <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-bold text-lg shadow-2xl shadow-amber-500/30 active:scale-[0.98] transition">
          Участвовать
        </button>
      </div>
    </div>
  );

  // ============ CALENDAR SCREEN ============
  const CalendarScreen = () => (
    <div className="pb-28">
      <Header title="Календарь" />
      <div className="px-4 space-y-4">
        <div className="rounded-2xl bg-[#2a1014]/80 border border-amber-900/20 p-1 flex">
          {[
            { id: 'all', label: 'Все' },
            { id: 'upcoming', label: 'Предстоящие' },
            { id: 'past', label: 'Прошедшие' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setCalendarFilter(f.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
                calendarFilter === f.id
                  ? 'bg-gradient-to-r from-amber-700/60 to-amber-600/60 text-white'
                  : 'text-amber-200/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {Object.entries(tournamentTypes).map(([key, t]) => (
            <button key={key} className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap ${t.color}`}>
              {t.label}
            </button>
          ))}
        </div>

        <button className="w-full rounded-2xl bg-[#2a1014]/80 border border-amber-900/20 p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <span className="text-white font-medium">Майский сезон</span>
          </div>
          <ChevronDown className="w-5 h-5 text-amber-400" />
        </button>

        {tournaments.map(t => (
          <div key={t.id}>
            <div className="flex items-baseline gap-3 mb-2 px-1">
              <span className="text-amber-300 font-bold">{t.day}</span>
              <span className="text-amber-200/40 text-sm">{t.date}</span>
            </div>
            <TournamentCard t={t} onClick={() => setSelectedTournament(t)} />
          </div>
        ))}
      </div>
    </div>
  );

  // ============ RATING SCREEN ============
  const RatingScreen = () => (
    <div className="pb-28">
      <Header title="Рейтинг" />
      <div className="px-4 space-y-4">
        <div className="rounded-2xl bg-[#2a1014]/80 border border-amber-900/20 p-1 flex">
          {[
            { id: 'global', label: 'Глобальный' },
            { id: 'season', label: 'Сезон' },
            { id: 'friends', label: 'Друзья' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setRatingFilter(f.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
                ratingFilter === f.id
                  ? 'bg-gradient-to-r from-amber-700/60 to-amber-600/60 text-white'
                  : 'text-amber-200/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400/60" />
          <input
            type="text"
            placeholder="Поиск по никнейму"
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#2a1014]/80 border border-amber-900/20 text-white placeholder:text-amber-200/30 focus:outline-none focus:border-amber-600/40"
          />
        </div>

        {/* Podium */}
        <div className="rounded-2xl bg-gradient-to-b from-amber-900/20 to-transparent border border-amber-700/20 p-4">
          <div className="grid grid-cols-3 gap-2 items-end">
            {[1, 0, 2].map((idx, i) => {
              const p = ratingData[idx];
              const medals = ['🥈', '🥇', '🥉'];
              const heights = ['h-24', 'h-32', 'h-20'];
              const colors = [
                'from-slate-400/30 to-slate-600/20 border-slate-400/30',
                'from-amber-400/40 to-amber-600/20 border-amber-400/40',
                'from-orange-700/30 to-orange-900/20 border-orange-700/30',
              ];
              return (
                <div key={i} className="text-center">
                  <div className="text-3xl mb-1">{medals[i]}</div>
                  <div className="text-white font-bold truncate text-sm">{p.name}</div>
                  <div className="text-amber-300 text-xs">{p.points.toLocaleString()}</div>
                  <div className={`mt-2 ${heights[i]} rounded-t-xl bg-gradient-to-t border ${colors[i]} flex items-start justify-center pt-2`}>
                    <span className="text-2xl font-bold text-white">{i === 1 ? 1 : i === 0 ? 2 : 3}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-amber-900/30 to-amber-950/30 border border-amber-600/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-amber-200/60 uppercase tracking-wider mb-1">Ваша позиция</div>
              <div className="text-2xl font-bold text-white">#45</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-amber-200/60">До #44 нужно</div>
              <div className="text-amber-300 font-bold">23 очка</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#2a1014]/80 border border-amber-900/20 overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-amber-900/20 text-xs uppercase tracking-wider text-amber-200/60">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Никнейм</div>
            <div className="col-span-3 text-right">Баунти</div>
            <div className="col-span-3 text-right">Очки</div>
          </div>
          {ratingData.slice(3).map((p, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 px-4 py-3 items-center border-b border-amber-900/10 last:border-b-0">
              <div className="col-span-1 text-amber-200/60 font-medium">{p.pos}</div>
              <div className="col-span-5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-700 to-rose-900 flex items-center justify-center text-white text-xs font-bold">
                  {p.name[0]}
                </div>
                <span className="text-white font-medium truncate">{p.name}</span>
                {p.change > 0 && <span className="text-emerald-400 text-xs">▲{p.change}</span>}
                {p.change < 0 && <span className="text-rose-400 text-xs">▼{Math.abs(p.change)}</span>}
              </div>
              <div className="col-span-3 text-right text-amber-100 font-medium">{p.bounties}</div>
              <div className="col-span-3 text-right text-amber-300 font-bold">{p.points.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ============ PROFILE SCREEN ============
  const ProfileScreen = () => (
    <div className="pb-28">
      <Header title="Профиль" />
      <div className="px-4 space-y-4">
        <div className="rounded-2xl bg-gradient-to-br from-[#3a1a1f] to-[#2a1014] border border-amber-900/30 p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-rose-800 flex items-center justify-center text-white font-bold text-2xl border-2 border-amber-500/50">
              L
            </div>
            <div className="flex-1">
              <div className="text-white font-bold text-xl">LuckNear</div>
              <div className="text-amber-200/60 text-sm">Серебро • #45 в рейтинге</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Очки', value: '8240' },
              { label: 'Баунти', value: '34' },
              { label: 'Турниров', value: '23' },
            ].map((s, i) => (
              <div key={i} className="rounded-xl bg-[#1a0a0c]/60 border border-amber-900/20 p-3 text-center">
                <div className="text-white font-bold text-xl">{s.value}</div>
                <div className="text-xs text-amber-200/50 uppercase tracking-wider mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'ITM%', value: '34%' },
              { label: 'Среднее место', value: '8.2' },
              { label: 'Топ-3 финиши', value: '5' },
              { label: 'Победы', value: '2' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-[#1a0a0c]/40 border border-amber-900/10 px-3 py-2">
                <span className="text-amber-200/60 text-xs">{s.label}</span>
                <span className="text-white font-bold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-[#2a1014]/80 border border-amber-900/20 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              Динамика рейтинга
            </h3>
            <span className="text-xs text-amber-200/60">30 дней</span>
          </div>
          <svg viewBox="0 0 300 80" className="w-full h-20">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(251, 191, 36, 0.4)" />
                <stop offset="100%" stopColor="rgba(251, 191, 36, 0)" />
              </linearGradient>
            </defs>
            <path d="M0,60 L30,55 L60,50 L90,40 L120,45 L150,30 L180,35 L210,25 L240,20 L270,15 L300,10 L300,80 L0,80 Z" fill="url(#chartGrad)" />
            <path d="M0,60 L30,55 L60,50 L90,40 L120,45 L150,30 L180,35 L210,25 L240,20 L270,15 L300,10" fill="none" stroke="rgb(251, 191, 36)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="300" cy="10" r="3" fill="rgb(251, 191, 36)" />
          </svg>
          <div className="text-emerald-400 text-sm font-medium mt-2">+340 очков за месяц</div>
        </div>

        {/* Achievements grouped */}
        <div className="rounded-2xl bg-[#2a1014]/80 border border-amber-900/20 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Достижения
            </h3>
            <span className="text-xs text-amber-300">{achievements.filter(a => a.unlocked).length}/{achievements.length}</span>
          </div>

          <div className="text-xs uppercase tracking-wider text-amber-200/40 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Редкие события
          </div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {achievements.filter(a => a.category === 'rare').map(a => (
              <div key={a.id} className={`rounded-xl border p-2 text-center transition ${
                a.unlocked
                  ? 'bg-gradient-to-br from-amber-900/40 to-amber-950/40 border-amber-600/40'
                  : 'bg-[#1a0a0c]/40 border-amber-900/10 opacity-40'
              }`}>
                <div className="text-2xl mb-1">{a.icon}</div>
                <div className="text-white text-[10px] font-medium leading-tight">{a.title}</div>
              </div>
            ))}
          </div>

          <div className="text-xs uppercase tracking-wider text-amber-200/40 mb-2 flex items-center gap-1">
            <Target className="w-3 h-3" /> Результаты
          </div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {achievements.filter(a => a.category === 'result').map(a => (
              <div key={a.id} className={`rounded-xl border p-2 text-center ${
                a.unlocked ? 'bg-[#1a0a0c]/60 border-amber-900/20' : 'bg-[#1a0a0c]/40 border-amber-900/10 opacity-40'
              }`}>
                <div className="text-2xl mb-1">{a.icon}</div>
                <div className="text-white text-[10px] font-medium leading-tight">{a.title}</div>
              </div>
            ))}
          </div>

          <div className="text-xs uppercase tracking-wider text-amber-200/40 mb-2 flex items-center gap-1">
            <Medal className="w-3 h-3" /> Турниры
          </div>
          <div className="grid grid-cols-4 gap-2">
            {achievements.filter(a => a.category === 'participation').map(a => (
              <div key={a.id} className={`rounded-xl border p-2 text-center ${
                a.unlocked ? 'bg-[#1a0a0c]/60 border-amber-900/20' : 'bg-[#1a0a0c]/40 border-amber-900/10 opacity-40'
              }`}>
                <div className="text-2xl mb-1">{a.icon}</div>
                <div className="text-white text-[10px] font-medium leading-tight">{a.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Referral */}
        <div className="rounded-2xl bg-gradient-to-br from-amber-900/30 to-rose-900/20 border border-amber-700/30 p-5">
          <h3 className="text-white font-bold flex items-center gap-2 mb-3">
            <Gift className="w-5 h-5 text-amber-400" />
            Пригласить друзей
          </h3>
          <p className="text-amber-100/70 text-sm mb-4">
            За каждые 10 сыгранных турниров вашего реферала — бесплатный билет
          </p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="rounded-xl bg-[#1a0a0c]/50 p-3 text-center">
              <div className="text-white font-bold text-xl">7</div>
              <div className="text-[10px] text-amber-200/50 uppercase tracking-wider mt-0.5">Приглашено</div>
            </div>
            <div className="rounded-xl bg-[#1a0a0c]/50 p-3 text-center">
              <div className="text-white font-bold text-xl">23</div>
              <div className="text-[10px] text-amber-200/50 uppercase tracking-wider mt-0.5">Игр сыграно</div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-amber-600/40 to-amber-800/40 border border-amber-500/40 p-3 text-center">
              <div className="text-white font-bold text-xl">2</div>
              <div className="text-[10px] text-amber-100 uppercase tracking-wider mt-0.5">Бесп. билета</div>
            </div>
          </div>
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-amber-200/60">До следующего билета</span>
              <span className="text-amber-300 font-medium">7 / 10 игр</span>
            </div>
            <div className="h-2 rounded-full bg-[#1a0a0c]/50 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full" style={{ width: '70%' }} />
            </div>
          </div>
          <button className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition">
            <Share2 className="w-4 h-4" />
            Поделиться ссылкой
          </button>
        </div>

        {/* Email binding */}
        <div className="rounded-2xl bg-[#2a1014]/80 border border-amber-900/20 p-5">
          <h3 className="text-white font-bold mb-2">Привязать email</h3>
          <p className="text-amber-100/60 text-sm mb-3">Чтобы входить через браузер</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-xl bg-[#1a0a0c]/60 border border-amber-900/20 text-white placeholder:text-amber-200/30 focus:outline-none focus:border-amber-600/40 text-sm"
            />
            <button className="px-4 py-3 rounded-xl bg-amber-700/60 border border-amber-600/40 text-white font-medium text-sm whitespace-nowrap">
              Получить код
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ============ NAVIGATION ============
  const BottomNav = () => {
    const items = [
      { id: 'home', icon: Home, label: 'Главная' },
      { id: 'calendar', icon: Calendar, label: 'Календарь' },
      { id: 'rating', icon: Trophy, label: 'Рейтинг' },
      { id: 'profile', icon: User, label: 'Профиль' },
    ];
    return (
      <div className="fixed bottom-3 left-0 right-0 px-4 z-40 max-w-md mx-auto">
        <div className="rounded-2xl bg-[#1a0a0c]/95 backdrop-blur-lg border border-amber-900/30 p-1.5 flex shadow-2xl">
          {items.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSelectedTournament(null); }}
                className={`flex-1 py-2.5 rounded-xl flex flex-col items-center gap-0.5 transition ${
                  active ? 'bg-gradient-to-br from-amber-700/60 to-amber-900/60' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-amber-200' : 'text-amber-200/40'}`} />
                <span className={`text-[10px] font-medium ${active ? 'text-amber-200' : 'text-amber-200/40'}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0f0608' }}>
      <div className="fixed inset-0" style={{ background: 'linear-gradient(180deg, #1a0a0c 0%, #0f0608 50%, #1a0a0c 100%)' }} />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-amber-700/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-rose-900/20 blur-3xl" />
      </div>

      <div className="relative max-w-md mx-auto min-h-screen">
        {selectedTournament ? (
          <TournamentDetail t={selectedTournament} />
        ) : (
          <>
            {activeTab === 'home' && <HomeScreen />}
            {activeTab === 'calendar' && <CalendarScreen />}
            {activeTab === 'rating' && <RatingScreen />}
            {activeTab === 'profile' && <ProfileScreen />}
          </>
        )}
        <BottomNav />
      </div>
    </div>
  );
}
```

---

## Что уже готово в прототипе

- Полный UI всех 4 основных экранов: Главная, Календарь, Рейтинг, Профиль
- Карточка турнира с разворачиваемой структурой блайндов
- Bottom navigation с активными состояниями
- Дизайн-система (цвета, кнопки, карточки, бейджи) на основе RAISE CLUB
- Все основные UI-паттерны: подиум топ-3, прогресс-бары, табы, фильтры, статистика

⚠️ **Важно:** прототип написан как один файл с inline-стилями и моками. При переносе в проект:
- Разбить на компоненты по FSD-слоям (см. "Контекст проекта")
- Заменить кастомные кнопки/карточки/табы на shadcn/ui компоненты с кастомизацией под дизайн
- Вынести моки в API-слой (entities/.../api) и заменить на реальные запросы

---

## Mapping: что куда уезжает по FSD

Сразу подсказка по разбиению прототипа:

| Элемент прототипа | Куда переносится |
|---|---|
| `<HomeScreen />` | `pages/home/ui/HomePage.tsx` |
| `<CalendarScreen />` | `pages/calendar/ui/CalendarPage.tsx` |
| `<RatingScreen />` | `pages/rating/ui/RatingPage.tsx` |
| `<ProfileScreen />` | `pages/profile/ui/ProfilePage.tsx` |
| `<TournamentDetail />` | `pages/tournament-detail/ui/TournamentDetailPage.tsx` |
| `<Header />` | `widgets/header/ui/Header.tsx` |
| `<BottomNav />` | `widgets/bottom-nav/ui/BottomNav.tsx` |
| `<TournamentCard />` | `entities/tournament/ui/TournamentCard.tsx` |
| `<TournamentTypeBadge />` | `entities/tournament/ui/TournamentTypeBadge.tsx` |
| `<ProgressBar />` | `shared/ui/ProgressBar.tsx` (или shadcn `Progress`) |
| `<Logo />` | `shared/ui/Logo.tsx` |
| Кнопка "Участвовать" + логика | `features/tournament-register/` |
| Кнопка "Подписаться" | `features/follow-user/` |
| Подиум топ-3 | `widgets/rating-podium/` |
| Таблица рейтинга | `widgets/rating-table/` |
| Лента друзей | `widgets/friends-feed/` |
| Сетка достижений | `widgets/achievements-grid/` |
| Реферальный блок | `widgets/referral-card/` |
| График рейтинга | `widgets/rating-chart/` |
| Структура блайндов | `entities/tournament/ui/BlindStructureTable.tsx` |
| Список участников | `widgets/tournament-participants/` |

---

## Что нужно доделать (TODO для AI-агента)

### 🔴 Критично (MVP)
- [ ] Инициализировать Next.js 14 проект с FSD-структурой папок (см. выше)
- [ ] Настроить shadcn/ui: `npx shadcn@latest init`, добавить базовые компоненты (button, card, dialog, sheet, tabs, input, select, toast, skeleton, avatar, badge, progress, separator, drawer)
- [ ] Кастомизировать CSS-переменные shadcn в `globals.css` под бордово-золотую тему
- [ ] Настроить ESLint-правила для запрета импортов вверх по слоям FSD (можно `eslint-plugin-boundaries` или `@feature-sliced/eslint-config`)
- [ ] Перенести JSX-прототип в Next.js проект, разбив на компоненты по mapping выше
- [ ] Настроить Prisma + SQLite со всеми моделями из PRD (User, Tournament, TournamentLevel, Registration, Season, Achievement, UserAchievement, Follow, ReferralProgress, RatingSnapshot, TournamentResult)
- [ ] Реализовать NextAuth.js v5: провайдер Telegram (валидация InitData) + Email OTP через Resend
- [ ] Заменить моки на реальные API-запросы (Server Actions или Route Handlers) в `entities/*/api/`
- [ ] Создать API-эндпоинты для всех CRUD-операций турниров и регистраций
- [ ] Реализовать запись на турнир / отмену с проверкой пересечений по времени (feature `tournament-register`)
- [ ] Реализовать админ-панель (`/admin`): создание турниров, ввод результатов, выдача ручных достижений
- [ ] Логика автоматических достижений (триггеры при сохранении TournamentResult)
- [ ] Расчёт RatingSnapshot ежедневным cron-job (node-cron или systemd timer)

### 🟡 Социальные функции (Milestone 2)
- [ ] Подписки на игроков (Follow) и страницы профилей других пользователей
- [ ] Лента друзей с агрегацией событий из TournamentResult и UserAchievement
- [ ] Фильтр "Друзья" в рейтинге (запрос по follow-связям текущего пользователя)
- [ ] Стрелочки динамики позиции в рейтинге (сравнение текущего и недельного снимков)

### 🟢 Достижения и рефералы (Milestone 3)
- [ ] Реферальные ссылки `reraise.club/r/{code}` с обработкой первой регистрации
- [ ] Логика начисления free_tickets за каждые 10 attended-игр реферала
- [ ] Применение free_tickets при записи на турнир (диалог выбора)
- [ ] Анимация разблокированного достижения при следующем входе

### 🔵 Уведомления (Milestone 4)
- [ ] Telegram-бот: напоминания за 24 часа и за 1 час до турнира
- [ ] Уведомление при освобождении места из листа ожидания
- [ ] Email-уведомления (Resend) для пользователей с привязанным email
- [ ] Настройки уведомлений в профиле (переключатели типов)
- [ ] Шаринг приглашения на турнир через Telegram Web App API (`window.Telegram.WebApp.openTelegramLink`)

### ⚪ Полировка
- [ ] Skeleton loaders на всех экранах
- [ ] Empty states (нет записей, нет подписок, нет достижений)
- [ ] Обработка ошибок и toast-уведомления (sonner)
- [ ] Telegram theme params: подхват цветовой схемы из Telegram при возможности
- [ ] PWA-манифест для веб-версии
- [ ] SEO-теги для публичных страниц
- [ ] Локализация (i18n): русский основной, английский опционально

### 🐛 Известные нюансы прототипа, которые нужно учесть
- В прототипе моки прописаны прямо в компоненте — заменить на Server Actions / запросы из `entities/*/api/`
- Иконки достижений сейчас эмодзи — подумать про SVG-набор для премиальности
- График динамики рейтинга — статический SVG, заменить на Recharts с реальными данными
- Sticky CTA "Участвовать" должна менять текст на "Отменить участие" при `Registration.status = registered`
- Все кастомные кнопки в прототипе (фильтры табов, основные CTA) — заменить на shadcn `Button` / `Tabs` / `ToggleGroup` с кастомными вариантами
- Inline-стили `style={{ background: '...' }}` в прототипе допустимы только для градиентов — остальное через Tailwind

### 📚 Связанные документы
- `PRD-ReraiseClub.md` — полные требования, модели данных, acceptance criteria
- `.claude/settings.json` — разрешения для непрерывной разработки через Claude Code
