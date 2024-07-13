import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { QrCode } from 'lucide-react';

import { useQRCode } from 'next-qrcode';
import { useEffect, useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';

import {
  generatePinQrCode,
  generateTableQrCode,
} from '@/lib/generateTableQrCode';
import jsPDF from 'jspdf';
import { Button } from './ui/button';
import { NEXT_BASE_URL } from '@/constants';
import { showPinTable } from '@/service/table';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export const ModalTablePrinter = () => {
  const { Canvas } = useQRCode();
  const session = useSession();

  const [table, setTable] = useState<number>(0);
  const [pinTable, setPinTable] = useState<string | null>(null);

  const link_url = `${NEXT_BASE_URL}/client/login?mesa=${table}`;

  async function handleGetPinTable() {
    if (!table || !session.data?.jwt) return;

    try {
      const response = await showPinTable({
        table_number: String(table),
        token: session.data?.jwt,
      });

      setPinTable(response.pin_table);
    } catch (error) {
      toast.error('Erro ao carregar pin da mesa');
    }
  }

  async function handleGenerateQrcodePdfTable() {
    const doc = new jsPDF('l', 'mm', [50, 50]);

    await generateTableQrCode(doc, table, link_url, document);
  }

  async function handleGenerateQrcodePdfPin() {
    if (!table || !session.data?.jwt) return;

    try {
      const response = await showPinTable({
        table_number: String(table),
        token: session.data?.jwt,
      });

      const doc = new jsPDF('l', 'mm', [50, 50]);

      await generatePinQrCode(doc, table, response.pin_table);
    } catch (error) {
      toast.error('Erro ao carregar pin da mesa');
    }
  }

  useEffect(() => {
    setPinTable(null);
  }, [table]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <QrCode className="text-white w-[25px] h-[25px] sm:w-[30px] sm:h-[30px] cursor-pointer" />
      </DialogTrigger>
      <DialogContent className="max-w-[350px] md:max-w-3xl dark:bg-[#1D1D1D] flex flex-col items-center justify-center">
        <DialogHeader>
          <DialogTitle>Imprimir QR Code da mesa</DialogTitle>
          <DialogDescription>
            Imprima QR Code da mesa sem nenhum problema
          </DialogDescription>
        </DialogHeader>
        <div className="inline-flex gap-8 items-center">
          <div className="inline mt-4">
            <Label className="font-Poppins font-normal text-[16px]">
              Mesa:
            </Label>
            <Input
              type="number"
              onChange={(e) => {
                let { value, min, max } = e.target;

                let parsedValue = Number(value);

                parsedValue = Math.max(
                  Number(min),
                  Math.min(Number(max), Number(value))
                );

                setTable(parsedValue);
              }}
              value={Number(table)}
              className="mt-1"
              max={30}
              min={1}
            />
          </div>
          <button
            onClick={handleGetPinTable}
            className="bg-[#FAC400] hover:bg-[#FAC400]/55 p-2 rounded-lg text-white mt-8"
          >
            Ver Pin
          </button>
        </div>

        <div className="flex flex-row gap-8">
          <Canvas
            text={link_url}
            options={{
              errorCorrectionLevel: 'M',
              margin: 3,
              scale: 4,
              width: 300,
            }}
          />

          {pinTable && (
            <div className="flex flex-col">
              <p className="text-[32px] font-semibold">PIN:</p>
              <span>{pinTable}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            className="bg-[#FAC400] text-white py-2 px-4 hover:bg-[#FAC400]/60"
            type="submit"
            onClick={handleGenerateQrcodePdfTable}
          >
            Gerar QR Code
          </Button>

          <Button
            className="bg-[#FAC400] text-white py-2 px-4 hover:bg-[#FAC400]/60"
            type="submit"
            onClick={handleGenerateQrcodePdfPin}
          >
            Gerar PIN
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
