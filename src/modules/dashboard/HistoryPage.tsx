import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History as HistoryIcon, Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function HistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Histórico</h1>
        <p className="text-slate-500 font-medium">Histórico completo de orçamentos e serviços realizados.</p>
      </div>

      <Card className="border-slate-200/60 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b py-4 flex flex-row items-center gap-4 justify-between">
          <div className="flex-1 max-w-sm relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
             <Input placeholder="Buscar por cliente ou n°..." className="pl-10 h-10 font-medium" />
          </div>
          <div className="flex gap-2">
             <Button variant="outline" size="sm" className="font-bold text-xs">Filtros</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold uppercase text-[10px] w-[100px]">N°</TableHead>
                <TableHead className="font-bold uppercase text-[10px]">Cliente</TableHead>
                <TableHead className="font-bold uppercase text-[10px]">Status</TableHead>
                <TableHead className="font-bold uppercase text-[10px]">Data</TableHead>
                <TableHead className="font-bold uppercase text-[10px] text-right">Valor</TableHead>
                <TableHead className="font-bold uppercase text-[10px] text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-slate-400 text-xs">#4521</TableCell>
                <TableCell className="font-bold">Condomínio Solar das Palmeiras</TableCell>
                <TableCell><Badge className="bg-emerald-500 text-white border-none font-bold text-[10px] uppercase">Aprovado</Badge></TableCell>
                <TableCell className="text-slate-500 text-sm font-medium">10/05/2026</TableCell>
                <TableCell className="text-right font-black">R$ 2.450,00</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="size-8"><Eye className="size-4" /></Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-slate-400 text-xs">#4520</TableCell>
                <TableCell className="font-bold">Restaurante Sabor Mineiro</TableCell>
                <TableCell><Badge className="bg-amber-500 text-white border-none font-bold text-[10px] uppercase">Pendente</Badge></TableCell>
                <TableCell className="text-slate-500 text-sm font-medium">08/05/2026</TableCell>
                <TableCell className="text-right font-black">R$ 850,00</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="size-8"><Eye className="size-4" /></Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
