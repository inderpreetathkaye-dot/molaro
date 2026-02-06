# molaro// Aura Events — Next.js App Router starter (single-file preview)
// Note: In a real Next.js project, split into /app routes and components.
// This single-file version is meant for quick preview and easy copy.

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Calendar,
  MapPin,
  Wallet,
  Users,
  Palette,
  Sun,
  Snowflake,
  Leaf,
  Flower2,
  Tag,
  TrendingUp,
  CheckCircle2,
  Clock,
  LogIn,
  LogOut,
  Save,
  Trash2,
  PartyPopper,
} from "lucide-react";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

// -----------------------------
// Helpers (local storage)
// -----------------------------

const LS_USER = "aura_events_user";
const LS_EVENTS = "aura_events_saved_events";

function safeJsonParse(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (raw != null) setState(safeJsonParse(raw, initialValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}

function uid() {
  return Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
}

// -----------------------------
// Domain data
// -----------------------------

const EVENT_TYPES = [
  { id: "wedding", label: "Wedding / Marriage" },
  { id: "engagement", label: "Engagement" },
  { id: "proposal", label: "Proposal" },
  { id: "birthday", label: "Birthday" },
  { id: "anniversary", label: "Anniversary" },
  { id: "baby_shower", label: "Baby Shower" },
  { id: "graduation", label: "Graduation" },
  { id: "family_gathering", label: "Family Gathering" },
];

const VIBES = [
  { id: "classic", label: "Classic" },
  { id: "minimal", label: "Minimal" },
  { id: "luxury", label: "Luxury" },
  { id: "traditional", label: "Traditional" },
  { id: "modern", label: "Modern" },
  { id: "garden", label: "Garden / Outdoor" },
  { id: "romantic", label: "Romantic" },
];

const SEASONS = [
  { id: "spring", label: "Spring", icon: Flower2 },
  { id: "summer", label: "Summer", icon: Sun },
  { id: "autumn", label: "Autumn", icon: Leaf },
  { id: "winter", label: "Winter", icon: Snowflake },
];

const CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Faisalabad",
  "Multan",
  "Rawalpindi",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Other",
];

function formatMoney(n) {
  const x = Number(n || 0);
  if (!Number.isFinite(x)) return "0";
  return x.toLocaleString();
}

function budgetTier(budget) {
  const b = Number(budget || 0);
  if (b <= 0) return "unknown";
  if (b < 30000) return "low";
  if (b < 150000) return "mid";
  return "high";
}

function clampGuests(n) {
  const x = Number(n || 0);
  if (!Number.isFinite(x)) return 0;
  return Math.max(1, Math.min(1000, Math.round(x)));
}

// -----------------------------
// Smart Suggestions Engine (v1)
// -----------------------------

function generatePalette(vibe, season) {
  const map = {
    minimal: {
      spring: ["Ivory", "Sage", "Soft Beige"],
      summer: ["White", "Sand", "Sky Blue"],
      autumn: ["Cream", "Warm Taupe", "Olive"],
      winter: ["White", "Charcoal", "Silver"],
    },
    luxury: {
      spring: ["Champagne", "Gold", "Blush"],
      summer: ["Pearl", "Gold", "Emerald"],
      autumn: ["Burgundy", "Gold", "Ivory"],
      winter: ["Black", "Gold", "Deep Red"],
    },
    traditional: {
      spring: ["Marigold", "Red", "Green"],
      summer: ["Orange", "Pink", "Gold"],
      autumn: ["Rust", "Red", "Cream"],
      winter: ["Red", "Gold", "Cream"],
    },
    modern: {
      spring: ["White", "Lilac", "Graphite"],
      summer: ["White", "Cobalt", "Black"],
      autumn: ["Ivory", "Mocha", "Black"],
      winter: ["White", "Navy", "Silver"],
    },
    garden: {
      spring: ["Mint", "Peach", "Ivory"],
      summer: ["Lime", "White", "Coral"],
      autumn: ["Olive", "Cream", "Terracotta"],
      winter: ["Pine", "Ivory", "Berry"],
    },
    romantic: {
      spring: ["Blush", "Ivory", "Rose"],
      summer: ["Pink", "White", "Gold"],
      autumn: ["Rosewood", "Cream", "Copper"],
      winter: ["Wine", "Ivory", "Gold"],
    },
    classic: {
      spring: ["Ivory", "Navy", "Gold"],
      summer: ["White", "Navy", "Champagne"],
      autumn: ["Cream", "Forest", "Gold"],
      winter: ["White", "Emerald", "Gold"],
    },
  };
  const v = map[vibe] || map.classic;
  return v[season] || v.spring;
}

function pickSignatureMoment(eventType) {
  const map = {
    wedding: [
      "A short ‘memory walk’ with photos of your story",
      "A 60‑second private vow exchange before the entrance",
      "A single spotlight first look + 5-minute photo burst",
    ],
    engagement: [
      "Ring reveal with a mini ‘sparkle station’ (candles + petals)",
      "A handwritten letter exchange before guests arrive",
      "A small dessert tower with your initials",
    ],
    proposal: [
      "A hidden note inside the bouquet",
      "A 30-second video message from friends/family",
      "A simple candle path + one song you both love",
    ],
    birthday: [
      "A ‘reasons we love you’ wall",
      "A surprise 30-second montage",
      "A signature mocktail named after them",
    ],
    anniversary: [
      "A mini timeline table (1 photo per year)",
      "A ‘future letters’ box to open later",
      "A private slow dance moment",
    ],
    baby_shower: [
      "A ‘wishes for baby’ card station",
      "A tiny name reveal corner",
      "A soft balloon cloud photo spot",
    ],
    graduation: [
      "A memory board of school photos",
      "A small award-style speech moment",
      "A cap toss photo countdown",
    ],
    family_gathering: [
      "A family quiz game with small prizes",
      "A shared gratitude moment",
      "A group photo with matching color dress code",
    ],
  };
  const options = map[eventType] || map.family_gathering;
  return options[Math.floor(Math.random() * options.length)];
}

function generateSuggestions(input) {
  const {
    eventType,
    budget,
    guests,
    city,
    season,
    vibe,
    notes,
  } = input;

  const tier = budgetTier(budget);
  const palette = generatePalette(vibe, season);
  const g = clampGuests(guests);

  const highImpactLowCost = [
    "Lighting beats decoration. Use warm fairy lights and candles (or LED candles).",
    "Pick ONE strong photo corner. It makes the whole event feel premium.",
    "Use a strict color palette (2–3 colors). Matching = expensive.",
    "Focus florals on entrance + stage/table only. Don’t spread them everywhere.",
    "One signature drink is better than 6 random options.",
  ];

  const foodIdeas = {
    low: [
      "1 main + 2 sides + dessert (simple, consistent, no waste)",
      "DIY beverage station (lemonade / iced tea)",
      "Cupcake tower instead of a large custom cake",
    ],
    mid: [
      "2 mains + 3 sides + dessert + one live counter (chaat / pasta)",
      "Signature mocktail bar",
      "Small cake + dessert table (brownies, donuts, macarons)",
    ],
    high: [
      "Multi-course feel: starter + mains + dessert bar",
      "Live stations (BBQ / pasta / dessert)",
      "Late-night snack mini boxes for guests",
    ],
  };

  const decorIdeas = {
    low: [
      "Fabric backdrop + fairy lights + 1 floral cluster",
      "Balloon garland + simple neon-style name board",
      "Table runners + candles for instant elegance",
    ],
    mid: [
      "Entrance arch + matching stage backdrop",
      "Fresh flower centerpieces on key tables",
      "Photo corner with props + warm lighting",
    ],
    high: [
      "Full theme styling (entrance + stage + ceiling accents)",
      "Professional lighting (warm wash + spotlight)",
      "Floral ceiling or hanging installation (small but impactful)",
    ],
  };

  const timeline = [
    { time: "T‑14 days", task: "Finalize guest list + venue confirmation" },
    { time: "T‑10 days", task: "Order decor + confirm outfits" },
    { time: "T‑7 days", task: "Send invites + finalize menu" },
    { time: "T‑3 days", task: "Confirm vendors + print signage" },
    { time: "T‑1 day", task: "Pack essentials + backup items" },
    { time: "Event day", task: "Follow timeline + enjoy the moment" },
  ];

  const budgetSplit = {
    low: [
      { label: "Food", pct: 45 },
      { label: "Decor", pct: 20 },
      { label: "Outfit", pct: 20 },
      { label: "Photo", pct: 10 },
      { label: "Extras", pct: 5 },
    ],
    mid: [
      { label: "Food", pct: 40 },
      { label: "Decor", pct: 25 },
      { label: "Photo", pct: 15 },
      { label: "Outfit", pct: 15 },
      { label: "Extras", pct: 5 },
    ],
    high: [
      { label: "Food", pct: 35 },
      { label: "Decor", pct: 30 },
      { label: "Photo", pct: 20 },
      { label: "Outfit", pct: 10 },
      { label: "Extras", pct: 5 },
    ],
    unknown: [
      { label: "Food", pct: 40 },
      { label: "Decor", pct: 25 },
      { label: "Photo", pct: 15 },
      { label: "Outfit", pct: 15 },
      { label: "Extras", pct: 5 },
    ],
  };

  const split = budgetSplit[tier] || budgetSplit.unknown;
  const budgetLines = split.map((s) => ({
    ...s,
    amount: Math.round((Number(budget || 0) * s.pct) / 100),
  }));

  const signatureMoment = pickSignatureMoment(eventType);

  const summary = {
    title: `${EVENT_TYPES.find((e) => e.id === eventType)?.label || "Event"} in ${city || "your city"}`,
    subtitle: `A ${vibe} vibe for ${g} guests — optimized for your budget.`,
    palette,
    signatureMoment,
    notesEcho: notes?.trim() ? notes.trim() : null,
  };

  return {
    tier,
    summary,
    decor: decorIdeas[tier] || decorIdeas.mid,
    food: foodIdeas[tier] || foodIdeas.mid,
    highImpactLowCost,
    timeline,
    budgetLines,
  };
}

// -----------------------------
// Seasonal offers + trends (mock)
// -----------------------------

function getSeasonalOffers(season, eventType) {
  const base = {
    spring: [
      { title: "Pastel Floral Package", off: "15%" },
      { title: "Garden Photo Corner", off: "10%" },
      { title: "Spring Dessert Table", off: "12%" },
    ],
    summer: [
      { title: "Outdoor Cooling Setup", off: "10%" },
      { title: "Sunset Lighting Add‑On", off: "12%" },
      { title: "Summer Mocktail Bar", off: "15%" },
    ],
    autumn: [
      { title: "Warm Candle + Fairy Light Decor", off: "18%" },
      { title: "Rust + Gold Theme Kit", off: "12%" },
      { title: "Cozy Seating Lounge", off: "10%" },
    ],
    winter: [
      { title: "Indoor Luxury Lighting", off: "15%" },
      { title: "Winter White Stage Setup", off: "12%" },
      { title: "Hot Chocolate Station", off: "10%" },
    ],
  };

  const extrasByEvent = {
    wedding: "(Wedding Season Special)",
    engagement: "(Ring Spotlight Add‑On)",
    proposal: "(Private Setup Deal)",
    birthday: "(Balloon + Cake Bundle)",
    anniversary: "(Romantic Dinner Bundle)",
    baby_shower: "(Soft Theme Bundle)",
    graduation: "(Photo Booth Bundle)",
    family_gathering: "(Family Feast Bundle)",
  };

  return (base[season] || base.spring).map((o) => ({
    ...o,
    title: `${o.title} ${extrasByEvent[eventType] || ""}`.trim(),
  }));
}

function getCityTrends(city) {
  const common = [
    "Minimal white + warm lighting",
    "One premium photo corner",
    "Matching dress code (2 colors)",
  ];

  const map = {
    Lahore: [
      "Marigold + red traditional themes",
      "Stage-focused florals (not full hall)",
      "Live food counter (chaat / BBQ)",
    ],
    Karachi: [
      "Modern minimal with bold accents",
      "Beachy palettes (sand + blue)",
      "Signature mocktail bar",
    ],
    Islamabad: [
      "Garden / outdoor setups",
      "Pastel themes",
      "Soft acoustic music vibe",
    ],
    Faisalabad: [
      "Big family style dining",
      "Traditional vibrant decor",
      "Photo wall with family names",
    ],
  };

  const local = map[city] || [
    "Elegant warm lighting themes",
    "Simple stage + premium entrance",
    "Dessert table + signage",
  ];

  return [...local, ...common].slice(0, 6);
}

// -----------------------------
// UI building blocks
// -----------------------------

function TopNav({ page, setPage, user, onLogout }) {
  return (
    <div className="sticky top-0 z-50 bg-white/70 backdrop-blur border-b">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setPage("home")}
          className="flex items-center gap-2"
        >
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-600 grid place-items-center shadow-sm">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold leading-tight">Aura Events</div>
            <div className="text-xs text-zinc-500 leading-tight">
              One life. One moment. Make it unforgettable.
            </div>
          </div>
        </button>

        <div className="hidden md:flex items-center gap-2">
          <Button
            variant={page === "create" ? "default" : "ghost"}
            onClick={() => setPage("create")}
          >
            Create Event
          </Button>
          <Button
            variant={page === "offers" ? "default" : "ghost"}
            onClick={() => setPage("offers")}
          >
            Seasonal Offers
          </Button>
          <Button
            variant={page === "trending" ? "default" : "ghost"}
            onClick={() => setPage("trending")}
          >
            Trending
          </Button>
          <Button
            variant={page === "dashboard" ? "default" : "ghost"}
            onClick={() => setPage("dashboard")}
          >
            Dashboard
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {user.name}
              </Badge>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <Button onClick={() => setPage("auth")}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}
        </div>
      </div>

      <div className="md:hidden border-t">
        <div className="mx-auto max-w-6xl px-2 py-2 grid grid-cols-4 gap-1">
          {[
            ["create", "Create"],
            ["offers", "Offers"],
            ["trending", "Trending"],
            ["dashboard", "Saved"],
          ].map(([k, label]) => (
            <Button
              key={k}
              variant={page === k ? "default" : "ghost"}
              className="w-full"
              onClick={() => setPage(k)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Pill({ icon: Icon, children }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm text-zinc-700 shadow-sm">
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 rounded-2xl bg-zinc-900 grid place-items-center">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <div className="text-lg font-semibold">{title}</div>
        {subtitle ? <div className="text-sm text-zinc-500">{subtitle}</div> : null}
      </div>
    </div>
  );
}

// -----------------------------
// Pages
// -----------------------------

function Home({ setPage, user }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-semibold tracking-tight"
          >
            Make your once‑in‑a‑lifetime moment
            <span className="text-zinc-500"> beautiful</span> — in your budget.
          </motion.h1>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 leading-relaxed">
            Aura Events helps you plan weddings, engagements, birthdays and more
            with smart suggestions, seasonal offers, and trending ideas based on
            your city.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Pill icon={Wallet}>Budget‑smart planning</Pill>
            <Pill icon={Palette}>Themes + colors</Pill>
            <Pill icon={TrendingUp}>Local trends</Pill>
            <Pill icon={Tag}>Seasonal offers</Pill>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button size="lg" onClick={() => setPage(user ? "create" : "auth")}
            >
              <PartyPopper className="h-5 w-5 mr-2" />
              Start Planning
            </Button>
            <Button size="lg" variant="outline" onClick={() => setPage("offers")}>
              See Seasonal Offers
            </Button>
          </div>

          <div className="mt-4 text-sm text-zinc-500">
            No real signup needed for demo — your events save in your browser.
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className=""
        >
          <Card className="rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                What you get
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {[
                {
                  t: "Smart Suggestions",
                  d: "Theme, decor, food, timeline, and budget breakdown — generated instantly.",
                },
                {
                  t: "Seasonal Offers",
                  d: "Event bundles that match the season and feel premium.",
                },
                {
                  t: "Trending by City",
                  d: "See what’s popular in your area right now.",
                },
                {
                  t: "Save & Reuse",
                  d: "Save your plan and come back anytime.",
                },
              ].map((x) => (
                <div key={x.t} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 mt-0.5" />
                  <div>
                    <div className="font-medium">{x.t}</div>
                    <div className="text-sm text-zinc-500">{x.d}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Separator className="my-10" />

      <div className="grid md:grid-cols-3 gap-4">
        {["Pick the moment", "Tell us your budget", "Get a beautiful plan"].map(
          (t, idx) => (
            <Card key={t} className="rounded-3xl shadow-sm">
              <CardContent className="p-6">
                <div className="text-xs text-zinc-500">Step {idx + 1}</div>
                <div className="text-lg font-semibold mt-1">{t}</div>
                <div className="text-sm text-zinc-600 mt-2">
                  {idx === 0
                    ? "Wedding, engagement, proposal, birthday — your big day starts here."
                    : idx === 1
                      ? "We split your budget smartly and suggest upgrades that matter."
                      : "Themes, colors, timeline, checklist, offers, and local trends."}
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}

function Auth({ setUser, setPage }) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("Lahore");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card className="rounded-3xl shadow-sm">
        <CardHeader>
          <CardTitle>Demo Login</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-2">
            <Label>Your name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ahsan" />
          </div>

          <div className="grid gap-2">
            <Label>City (for trends + offers)</Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger>
                <SelectValue placeholder="Select your city" />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            size="lg"
            onClick={() => {
              const user = { id: uid(), name: name.trim() || "Guest", city };
              localStorage.setItem(LS_USER, JSON.stringify(user));
              setUser(user);
              setPage("create");
            }}
          >
            <LogIn className="h-5 w-5 mr-2" />
            Continue
          </Button>

          <div className="text-sm text-zinc-500">
            This is a demo login. No passwords, no real data stored online.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CreateEvent({ user, onGenerated }) {
  const [eventType, setEventType] = useState("wedding");
  const [budget, setBudget] = useState(80000);
  const [guests, setGuests] = useState(200);
  const [city, setCity] = useState(user?.city || "Lahore");
  const [season, setSeason] = useState("winter");
  const [vibe, setVibe] = useState("classic");
  const [notes, setNotes] = useState("");

  const tier = budgetTier(budget);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle>Create your event</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Event type</Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Season</Label>
                <Select value={season} onValueChange={setSeason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEASONS.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>City</Label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Vibe</Label>
                <Select value={vibe} onValueChange={setVibe}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vibe" />
                  </SelectTrigger>
                  <SelectContent>
                    {VIBES.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Budget (PKR)</Label>
                <Input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  min={0}
                />
                <div className="text-xs text-zinc-500">
                  Tier: {tier === "low" ? "Low" : tier === "mid" ? "Medium" : tier === "high" ? "High" : "—"}
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Guests</Label>
                <Input
                  type="number"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  min={1}
                  max={1000}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. simple stage, no loud music, outdoor preferred..."
              />
            </div>

            <Button
              size="lg"
              onClick={() => {
                const payload = {
                  eventType,
                  budget,
                  guests,
                  city,
                  season,
                  vibe,
                  notes,
                };
                const output = generateSuggestions(payload);
                onGenerated({ input: payload, output });
              }}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Generate Smart Suggestions
            </Button>

            <div className="text-sm text-zinc-500">
              Aura Events generates a plan instantly — no vendors required.
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle>What Aura will generate</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {[
              [Palette, "Theme + color palette"],
              [Wallet, "Budget split"],
              [Clock, "Timeline + checklist"],
              [Sparkles, "High‑impact low‑cost upgrades"],
              [Tag, "Seasonal offers"],
              [TrendingUp, "Trends in your city"],
            ].map(([Icon, text]) => (
              <div key={text} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-2xl bg-zinc-100 grid place-items-center">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-sm text-zinc-700">{text}</div>
              </div>
            ))}

            <Separator />

            <div className="text-sm text-zinc-500">
              Tip: Your website will feel 10x better if you keep the suggestions
              short, clean, and actionable.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Suggestions({ generated, user, onSave, setPage }) {
  const { input, output } = generated;

  const offers = useMemo(
    () => getSeasonalOffers(input.season, input.eventType),
    [input.season, input.eventType]
  );

  const trends = useMemo(() => getCityTrends(input.city), [input.city]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold">Smart Suggestions</div>
          <div className="text-sm text-zinc-500">
            Generated for {user?.name || "Guest"}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPage("create")}>
            Edit
          </Button>
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save to Dashboard
          </Button>
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        <Card className="rounded-3xl shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle>{output.summary.title}</CardTitle>
            <div className="text-sm text-zinc-500">{output.summary.subtitle}</div>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                {input.city}
              </Badge>
              <Badge variant="secondary" className="rounded-full">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {SEASONS.find((s) => s.id === input.season)?.label}
              </Badge>
              <Badge variant="secondary" className="rounded-full">
                <Users className="h-3.5 w-3.5 mr-1" />
                {clampGuests(input.guests)} guests
              </Badge>
              <Badge variant="secondary" className="rounded-full">
                <Wallet className="h-3.5 w-3.5 mr-1" />
                PKR {formatMoney(input.budget)}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="rounded-3xl">
                <CardContent className="p-5 grid gap-2">
                  <div className="font-semibold">Theme palette</div>
                  <div className="flex flex-wrap gap-2">
                    {output.summary.palette.map((p) => (
                      <Badge key={p} className="rounded-full" variant="outline">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-3xl">
                <CardContent className="p-5 grid gap-2">
                  <div className="font-semibold">Signature moment</div>
                  <div className="text-sm text-zinc-600">{output.summary.signatureMoment}</div>
                </CardContent>
              </Card>
            </div>

            {output.summary.notesEcho ? (
              <Card className="rounded-3xl">
                <CardContent className="p-5">
                  <div className="text-sm font-semibold">Your notes</div>
                  <div className="text-sm text-zinc-600 mt-1">{output.summary.notesEcho}</div>
                </CardContent>
              </Card>
            ) : null}

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Decor ideas
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {output.decor.map((x) => (
                    <div key={x} className="flex gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 mt-0.5" />
                      <span className="text-zinc-700">{x}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Food ideas
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {output.food.map((x) => (
                    <div key={x} className="flex gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 mt-0.5" />
                      <span className="text-zinc-700">{x}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Budget split (recommended)
                </CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-3">
                {output.budgetLines.map((b) => (
                  <div key={b.label} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-700">{b.label}</span>
                    <span className="text-zinc-500">{b.pct}%</span>
                    <span className="font-medium">PKR {formatMoney(b.amount)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Timeline (simple)
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                {output.timeline.map((t) => (
                  <div key={t.time} className="flex items-start gap-3">
                    <Badge variant="outline" className="rounded-full">
                      {t.time}
                    </Badge>
                    <div className="text-sm text-zinc-700">{t.task}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  High‑impact, low‑cost
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                {output.highImpactLowCost.map((x) => (
                  <div key={x} className="flex gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 mt-0.5" />
                    <span className="text-zinc-700">{x}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Seasonal offers
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {offers.map((o) => (
                <div key={o.title} className="rounded-2xl border p-4">
                  <div className="font-medium">{o.title}</div>
                  <div className="text-sm text-zinc-500">Save {o.off}</div>
                </div>
              ))}
              <Button variant="outline" onClick={() => setPage("offers")}>
                View all offers
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trending in {input.city}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {trends.map((x) => (
                <div key={x} className="flex gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 mt-0.5" />
                  <span className="text-zinc-700">{x}</span>
                </div>
              ))}
              <Button variant="outline" onClick={() => setPage("trending")}>
                See trends
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Offers({ user }) {
  const [season, setSeason] = useState("winter");
  const [eventType, setEventType] = useState("wedding");

  const offers = useMemo(
    () => getSeasonalOffers(season, eventType),
    [season, eventType]
  );

  const Icon = SEASONS.find((s) => s.id === season)?.icon || Tag;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
        <SectionTitle
          icon={Tag}
          title="Seasonal Offers"
          subtitle="Bundles that match the season and feel premium — even on a budget."
        />
        <div className="flex gap-2">
          <Select value={season} onValueChange={setSeason}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Season" />
            </SelectTrigger>
            <SelectContent>
              {SEASONS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Event" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <Card className="rounded-3xl shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              {SEASONS.find((s) => s.id === season)?.label} deals
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {offers.map((o) => (
              <div key={o.title} className="rounded-2xl border p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{o.title}</div>
                    <div className="text-sm text-zinc-500">
                      Limited seasonal bundle for {user?.city || "your city"}
                    </div>
                  </div>
                  <Badge className="rounded-full">{o.off} OFF</Badge>
                </div>
                <div className="mt-3 text-sm text-zinc-600">
                  Includes styling, basic decor elements, and a simple premium
                  touch that looks great in photos.
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Pro tip</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-600 leading-relaxed">
            Seasonal offers should always be tied to what people actually want
            that season:
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li>Winter: warm lighting, indoor luxury</li>
              <li>Summer: cooling, sunset vibe</li>
              <li>Spring: florals + pastels</li>
              <li>Autumn: candles, warm colors</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Trending({ user }) {
  const [city, setCity] = useState(user?.city || "Lahore");
  const trends = useMemo(() => getCityTrends(city), [city]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
        <SectionTitle
          icon={TrendingUp}
          title="Trending by City"
          subtitle="See what people are loving right now in your area."
        />
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            {CITIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle>Top trends in {city}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {trends.map((x) => (
              <div key={x} className="flex gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 mt-0.5" />
                <span className="text-zinc-700">{x}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle>Why this matters</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-600 leading-relaxed">
            Trending helps your website feel alive.
            <div className="mt-3" />
            Later, you can make this real by collecting:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Most selected themes</li>
              <li>Popular palettes</li>
              <li>Most saved offers</li>
              <li>Vendor bookings (future)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Dashboard({ savedEvents, onDelete, setPage }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
        <SectionTitle
          icon={Save}
          title="Dashboard"
          subtitle="Your saved event plans (stored in your browser)."
        />
        <Button onClick={() => setPage("create")}>
          <PartyPopper className="h-4 w-4 mr-2" />
          Create new
        </Button>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {savedEvents.length === 0 ? (
          <Card className="rounded-3xl shadow-sm md:col-span-2">
            <CardContent className="p-8 text-center">
              <div className="text-lg font-semibold">No saved events yet</div>
              <div className="text-sm text-zinc-500 mt-1">
                Create an event to generate suggestions and save it.
              </div>
              <div className="mt-5">
                <Button onClick={() => setPage("create")}>Create event</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          savedEvents.map((e) => (
            <Card key={e.id} className="rounded-3xl shadow-sm">
              <CardContent className="p-6 grid gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{e.output.summary.title}</div>
                    <div className="text-sm text-zinc-500">{e.output.summary.subtitle}</div>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => onDelete(e.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="rounded-full">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {e.input.city}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full">
                    <Wallet className="h-3.5 w-3.5 mr-1" />
                    PKR {formatMoney(e.input.budget)}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full">
                    <Users className="h-3.5 w-3.5 mr-1" />
                    {clampGuests(e.input.guests)}
                  </Badge>
                </div>

                <div className="text-sm text-zinc-600">
                  <span className="font-medium">Signature moment:</span> {e.output.summary.signatureMoment}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// -----------------------------
// App Shell
// -----------------------------

export default function AuraEventsApp() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("home");
  const [generated, setGenerated] = useState(null);

  const [savedEvents, setSavedEvents] = useLocalStorageState(LS_EVENTS, []);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(LS_USER) : null;
    if (raw) setUser(safeJsonParse(raw, null));
  }, []);

  function logout() {
    localStorage.removeItem(LS_USER);
    setUser(null);
    setPage("home");
  }

  function requireAuth(nextPage) {
    if (!user) {
      setPage("auth");
      return;
    }
    setPage(nextPage);
  }

  function saveGenerated() {
    if (!generated) return;
    const record = {
      id: uid(),
      createdAt: Date.now(),
      ...generated,
    };
    setSavedEvents([record, ...savedEvents]);
    setPage("dashboard");
  }

  function deleteSaved(id) {
    setSavedEvents(savedEvents.filter((x) => x.id !== id));
  }

  const content = useMemo(() => {
    if (page === "home") return <Home setPage={(p) => (p === "create" ? requireAuth("create") : setPage(p))} user={user} />;
    if (page === "auth") return <Auth setUser={setUser} setPage={setPage} />;
    if (page === "create")
      return (
        <CreateEvent
          user={user}
          onGenerated={(g) => {
            setGenerated(g);
            setPage("suggestions");
          }}
        />
      );
    if (page === "suggestions")
      return (
        <Suggestions
          generated={generated}
          user={user}
          onSave={saveGenerated}
          setPage={setPage}
        />
      );
    if (page === "offers") return <Offers user={user} />;
    if (page === "trending") return <Trending user={user} />;
    if (page === "dashboard") return <Dashboard savedEvents={savedEvents} onDelete={deleteSaved} setPage={setPage} />;
    return <Home setPage={setPage} user={user} />;
  }, [page, user, generated, savedEvents]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white text-zinc-900">
      <TopNav
        page={page}
        setPage={(p) => {
          if (["create", "dashboard"].includes(p)) return requireAuth(p);
          setPage(p);
        }}
        user={user}
        onLogout={logout}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {content}
        </motion.div>
      </AnimatePresence>

      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-zinc-500 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} Aura Events</div>
          <div className="flex gap-3">
            <span>Smart suggestions</span>
            <span>•</span>
            <span>Seasonal offers</span>
            <span>•</span>
            <span>Trending by city</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
