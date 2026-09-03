/**
 * Test: Unit - UI Base Components Audit (Dialog, Sheet, CollapsibleSection)
 * Validates initialization, prop contracts, and component composition.
 */

import React from 'react';
import { describe, test, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '../../src/components/ui/dialog';
import { 
  Sheet, 
  SheetTrigger, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetFooter 
} from '../../src/components/ui/sheet';
import { 
  CollapsibleSection, 
  Collapsible, 
  CollapsibleTrigger, 
  CollapsibleContent 
} from '../../src/components/ui/collapsible-section';

describe('UI Base Components Verification (PestFlow Standards)', () => {

  test('Dialog subcomponents instantiate correctly with standard props', () => {
    const dialogElement = React.createElement(
      Dialog,
      { defaultOpen: false },
      React.createElement(DialogTrigger, { id: 'test-dialog-trigger' }, 'Abrir Modal'),
      React.createElement(
        DialogContent,
        { size: 'md', id: 'test-dialog-content' },
        React.createElement(
          DialogHeader,
          null,
          React.createElement(DialogTitle, null, 'Título do Modal'),
          React.createElement(DialogDescription, null, 'Descrição auxiliar da ação secundária')
        ),
        React.createElement('div', { id: 'modal-body' }, 'Formulário ou conteúdo do modal'),
        React.createElement(
          DialogFooter,
          null,
          React.createElement('button', { type: 'button' }, 'Salvar')
        )
      )
    );

    const rendered = renderToString(dialogElement);
    expect(rendered).toContain('id="test-dialog-trigger"');
    expect(rendered).toContain('Abrir Modal');
  });

  test('Sheet subcomponents instantiate correctly with standard props', () => {
    const sheetElement = React.createElement(
      Sheet,
      { defaultOpen: false },
      React.createElement(SheetTrigger, { id: 'test-sheet-trigger' }, 'Abrir Painel Lateral'),
      React.createElement(
        SheetContent,
        { side: 'right', id: 'test-sheet-content' },
        React.createElement(
          SheetHeader,
          null,
          React.createElement(SheetTitle, null, 'Painel Auxiliar'),
          React.createElement(SheetDescription, null, 'Histórico ou chat lateral')
        ),
        React.createElement('div', null, 'Conteúdo do sheet'),
        React.createElement(SheetFooter, null, 'Rodapé')
      )
    );

    const rendered = renderToString(sheetElement);
    expect(rendered).toContain('id="test-sheet-trigger"');
    expect(rendered).toContain('Abrir Painel Lateral');
  });

  test('CollapsibleSection renders title, badge, description, and children when open', () => {
    const sectionElement = React.createElement(
      CollapsibleSection,
      {
        title: 'Custos Adicionais',
        description: 'Detalhamento de taxas e quilometragem',
        badge: '3 itens',
        open: true,
        variant: 'card',
        id: 'sec-custos'
      },
      React.createElement('div', { id: 'inner-content' }, 'Tabela de custos extras')
    );

    const rendered = renderToString(sectionElement);
    expect(rendered).toContain('Custos Adicionais');
    expect(rendered).toContain('Detalhamento de taxas e quilometragem');
    expect(rendered).toContain('3 itens');
    expect(rendered).toContain('Tabela de custos extras');
    expect(rendered).toContain('data-slot="collapsible-section"');
  });

  test('CollapsibleSection supports controlled closed state and low-level primitives', () => {
    const closedElement = React.createElement(
      CollapsibleSection,
      {
        title: 'Filtros Avançados',
        open: false,
        variant: 'bordered'
      },
      React.createElement('div', null, 'Conteúdo oculto')
    );

    const renderedClosed = renderToString(closedElement);
    expect(renderedClosed).toContain('Filtros Avançados');
    expect(renderedClosed).toContain('data-slot="collapsible-section"');

    // Test low-level primitives composition
    const primitiveElement = React.createElement(
      Collapsible,
      { defaultOpen: true },
      React.createElement(CollapsibleTrigger, null, 'Toggle'),
      React.createElement(CollapsibleContent, null, 'Primitive Body')
    );

    const renderedPrimitives = renderToString(primitiveElement);
    expect(renderedPrimitives).toContain('Toggle');
    expect(renderedPrimitives).toContain('Primitive Body');
  });

});
