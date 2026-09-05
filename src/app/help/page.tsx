'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, HelpCircle, FileText, Boxes, Wrench, Lock, ArrowRight, Building2 } from 'lucide-react';

export default function HelpCenterPage() {
  const [query, setQuery] = useState('');

  const articles = [
    {
      id: 'h-1',
      category: 'CAD Intelligence',
      title: 'How to upload and parse DXF vector drawings',
      description: 'Learn how ForgeIQ extracts cut perimeters, hole counts, bend lines, and material weight.',
      icon: Boxes,
    },
    {
      id: 'h-2',
      category: 'Quotation Engine',
      title: 'Configuring custom pricing rules and GST rates',
      description: 'Step-by-step guide to updating material prices, machine rates, labor costs, and profit margins.',
      icon: FileText,
    },
    {
      id: 'h-3',
      category: 'Shop Floor Operations',
      title: 'Managing the Production Kanban Board & Machine Telemetry',
      description: 'How to move work order stages, assign operators, and log equipment setup times.',
      icon: Wrench,
    },
    {
      id: 'h-4',
      category: 'B2B Marketplace & Escrow',
      title: 'Understanding 4-Stage Milestone Escrow Protection',
      description: 'How buyer deposits are held and released upon quality inspection signoffs.',
      icon: Lock,
    },
  ];

  const filtered = articles.filter(
    (a) => a.title.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Navbar */}
      <header className="border-b border-steel-800 bg-slate-950/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 font-extrabold text-white text-sm">
              F
            </div>
            <span className="font-extrabold text-white text-sm">ForgeIQ Help Center</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button size="sm" variant="outline" className="border-steel-700 text-slate-300">
              Return to Factory ERP <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-12 space-y-8">
        {/* Search Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-black text-white">How can we help you today?</h1>
          <div className="relative max-w-xl mx-auto flex items-center">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documentation... (e.g. CAD, Pricing, Escrow)"
              className="pl-10 h-11 bg-steel-900 border-steel-700 text-white text-xs rounded-xl"
            />
          </div>
        </div>

        {/* Documentation Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((art) => {
            const Icon = art.icon;
            return (
              <Card key={art.id} className="border-steel-800 bg-steel-900/80 text-white hover:border-brand-500 transition-all cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-400">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">{art.category}</span>
                  </div>
                  <CardTitle className="text-sm font-bold text-white mt-1">{art.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-400">{art.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
