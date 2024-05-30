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
import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';

import { generateTableQrCode } from '@/lib/generateTableQrCode';
import jsPDF from 'jspdf';
import { Button } from './ui/button';
import { NEXT_BASE_URL } from '@/constants';

export const ModalTablePrinter = () => {
  const { Canvas } = useQRCode();

  const [table, setTable] = useState<number>(0);

  const link_url = `${NEXT_BASE_URL}/client/login?table=${table}`;

  async function handleGeneratePdfTable() {
    const doc = new jsPDF('l', 'mm', [50, 50]);

    await generateTableQrCode(doc, table, link_url, document);
  }

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
        <div className="inline mt-4">
          <Label className="font-Poppins font-normal text-[16px]">Mesa:</Label>
          <Input
            type="number"
            onChange={(e) => setTable(Number(e.target.value))}
            value={Number(table)}
            className="mt-1"
          />
        </div>

        <Canvas
          text={link_url}
          options={{
            errorCorrectionLevel: 'M',
            margin: 3,
            scale: 4,
            width: 300,
          }}
        />

        <DialogFooter>
          <Button
            className="bg-[#FAC400] text-white py-2 px-4 hover:bg-[#FAC400]/60"
            type="submit"
            onClick={handleGeneratePdfTable}
          >
            Gerar QR Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
