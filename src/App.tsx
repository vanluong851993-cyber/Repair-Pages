import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { RepairOrdersView } from './views/RepairOrdersView';
import { PendingRepairsView } from './views/PendingRepairsView';
import { WaitingPickupView } from './views/WaitingPickupView';
import { ProductsView } from './views/ProductsView';
import { LowStockView } from './views/LowStockView';
import { StockInView } from './views/StockInView';
import { PosView } from './views/PosView';
import { DebtsView } from './views/DebtsView';
import { WarrantiesView } from './views/WarrantiesView';
import { TechniciansView } from './views/TechniciansView';
import { CustomersView } from './views/CustomersView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { RepairDetailModal } from './components/RepairDetailModal';
import { NewRepairModal } from './components/NewRepairModal';
import { PrintModal } from './components/PrintModal';

const AppContent: React.FC = () => {
  const { activeTab, selectedOrderId, setSelectedOrderId } = useApp();

  const [isNewRepairModalOpen, setIsNewRepairModalOpen] = useState(false);
  const [printOrderId, setPrintOrderId] = useState<string | null>(null);

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900 overflow-hidden select-none">
      {/* Sidebar Navigation */}
      <Sidebar onOpenNewRepairModal={() => setIsNewRepairModalOpen(true)} />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header onOpenNewRepairModal={() => setIsNewRepairModalOpen(true)} />

        {/* Dynamic View Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {activeTab === 'dashboard' && (
            <DashboardView onOpenNewRepairModal={() => setIsNewRepairModalOpen(true)} />
          )}

          {activeTab === 'repairs' && (
            <RepairOrdersView
              onOpenNewRepairModal={() => setIsNewRepairModalOpen(true)}
              onOpenDetailModal={(id) => setSelectedOrderId(id)}
              onOpenPrintModal={(id) => setPrintOrderId(id)}
            />
          )}

          {activeTab === 'pending_repairs' && (
            <PendingRepairsView
              onOpenDetailModal={(id) => setSelectedOrderId(id)}
              onOpenPrintModal={(id) => setPrintOrderId(id)}
            />
          )}

          {activeTab === 'waiting_pickup' && (
            <WaitingPickupView
              onOpenDetailModal={(id) => setSelectedOrderId(id)}
              onOpenPrintModal={(id) => setPrintOrderId(id)}
            />
          )}

          {activeTab === 'products' && <ProductsView />}

          {activeTab === 'low_stock' && <LowStockView />}

          {activeTab === 'stock_in' && <StockInView />}

          {activeTab === 'stock_out' && <StockInView />}

          {activeTab === 'pos' && <PosView />}

          {activeTab === 'debts' && <DebtsView />}

          {activeTab === 'warranties' && (
            <WarrantiesView onOpenDetailModal={(id) => setSelectedOrderId(id)} />
          )}

          {activeTab === 'technicians' && <TechniciansView />}

          {activeTab === 'customers' && (
            <CustomersView onOpenDetailModal={(id) => setSelectedOrderId(id)} />
          )}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      {selectedOrderId && (
        <RepairDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onOpenPrintModal={(id) => {
            setPrintOrderId(id);
          }}
        />
      )}

      {isNewRepairModalOpen && (
        <NewRepairModal
          onClose={() => setIsNewRepairModalOpen(false)}
          onSuccess={(id) => {
            setIsNewRepairModalOpen(false);
            setSelectedOrderId(id);
          }}
        />
      )}

      {printOrderId && (
        <PrintModal
          orderId={printOrderId}
          onClose={() => setPrintOrderId(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
