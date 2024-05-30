'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';

import { Loader, Pencil, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Input } from './ui/input';

import { Switch } from './ui/switch';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';
import { IProduct, createProduct, updateProduct } from '@/service/products';

interface ModalEditProductProps {
  data?: IProduct;
}

const FormSchema = z.object({
  name: z.string({
    required_error: 'É necessário um nome',
  }),
  price: z
    .number({
      required_error: 'É necessário um valor para o produto',
    })
    .or(z.string())
    .optional()
    .default(0)
    .transform((value) => Number(value || 0)),

  active: z.boolean().default(false),
});

export type ICreateProduct = z.infer<typeof FormSchema>;

export const ModalEditProduct = ({ data }: ModalEditProductProps) => {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      active: data?.active || false,
      name: data?.name || '',
      price: data?.price || 0,
    },
  });

  function onCloseModal() {
    // form.reset();
    setOpen(false);
  }

  async function onSubmit(formData: ICreateProduct) {
    try {
      if (data?.id) {
        await updateProduct({
          id: data.id,
          active: formData.active,
          name: formData.name,
          price: formData.price,
        });
      } else {
        await createProduct({
          active: formData!.active!,
          name: formData!.name,
          price: formData!.price,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['/products'] });

      onCloseModal();
    } catch (error) {
      console.log(error);

      toast.error('Erro ao criar o produto');
    }
  }

  function handleOpenModal() {
    setOpen(true);
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onCloseModal()}>
      <DialogTrigger asChild>
        {!data ? (
          <Button
            onClick={handleOpenModal}
            className="flex gap-2 bg-[#FAC400] text-white py-2 px-4 hover:bg-[#FAC400]/60 items-center justify-center mb-6 text-sm font-medium transition duration-300 rounded-2xl  focus:ring-2 focus:ring-gray-300"
          >
            <PlusCircle />
            Adicionar produto
          </Button>
        ) : (
          <Pencil className="cursor-pointer" onClick={handleOpenModal} />
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[350px] md:max-w-3xl dark:bg-[#1D1D1D]">
        <Form {...form}>
          <form
            className="grid gap-4 py-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <DialogHeader>
              <DialogTitle>{!data ? 'Criar' : 'Editar'} Produto</DialogTitle>
              <DialogDescription>Faça alterações no produto</DialogDescription>
            </DialogHeader>
            {/* first line on form */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* field title */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={field.onChange}
                        type="number"
                        step={0.1}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-col min-w-20 items-center">
                    <FormLabel className="mb-2">Ativo</FormLabel>
                    <FormControl>
                      <Switch
                        className="data-[state=checked]:bg-[#FAC400]"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                className="bg-[#FAC400] text-white py-2 px-4 hover:bg-[#FAC400]/60"
                type="submit"
                disabled={
                  form.formState.isLoading || form.formState.isSubmitting
                }
              >
                Submeter
                {form.formState.isSubmitting && (
                  <Loader className="animate-spin ml-2" />
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
