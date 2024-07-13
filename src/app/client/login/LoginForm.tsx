'use client';

import { Button } from '@/components/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';

import { signIn } from 'next-auth/react';

import { useSearchParams } from 'next/navigation';
import { z } from 'zod';

import validator from 'validator';
import { toast } from 'sonner';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

const LoginClientSchema = z.object({
  table: z
    .number()
    .or(z.string())
    .optional()
    .default(0)
    .transform((value) => Number(value || 0)),
  phone_number: z
    .string({
      required_error: 'É necessário um número de telemóvel',
    })
    .refine((value) => validator.isMobilePhone(value, 'pt-PT'), {
      message: 'Insira um número válido',
    }),
  pin_table: z.string().length(6, { message: 'Tem de ter 6 caracteres' }),
});

type LoginSchema = z.infer<typeof LoginClientSchema>;
export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPinTable, setShowPinTable] = useState(false);

  const _table = searchParams.get('mesa');

  const form = useForm<LoginSchema>({
    resolver: zodResolver(LoginClientSchema),
    defaultValues: {
      table: _table ? Number(_table) : 0,
      phone_number: '',
      pin_table: '',
    },
  });

  async function onSubmit({ pin_table, phone_number, table }: LoginSchema) {
    if (!table) {
      return toast.warning('Mesa não definida', {
        description: 'Tente ler o código QRCode de novo',
        duration: 8000,
      });
    }

    const response = await signIn('credentials', {
      pin_table,
      phone_number,
      table,
      type: 'client',
      redirect: false,
    });

    localStorage.setItem('@JATO:FOOD:TABLE', String(table));

    if (!response?.ok) {
      toast.error('Número de telemóvel ou pin inválidos');
    } else {
      router.push('/client');
    }
  }

  return (
    <Form {...form}>
      <form className="grid gap-4 py-4" onSubmit={form.handleSubmit(onSubmit)}>
        {/* field mesa */}
        <FormField
          control={form.control}
          name="table"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Número de Mesa</FormLabel>
              <FormControl>
                <Input {...field} type="number" onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Número de Telemóvel (*)</FormLabel>
              <FormControl>
                <Input {...field} type="tel" onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pin_table"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Pin da Mesa (*)</FormLabel>
              <FormControl>
                <div className="flex flex-row items-center gap-4">
                  <Input
                    type={showPinTable ? 'text' : 'password'}
                    {...field}
                    onChange={field.onChange}
                  />
                  <button
                    type="button"
                    className="p-2 bg-orange-600 hover:bg-orange-600/55 rounded-lg"
                    onClick={() => setShowPinTable((prev) => !prev)}
                  >
                    {showPinTable ? (
                      <EyeIcon className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <EyeOffIcon className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={form.formState.isLoading || form.formState.isSubmitting}
        >
          Entrar
          {/* {form.formState.isSubmitting && (
      <Loader className="animate-spin ml-2" />
    )} */}
        </Button>
      </form>
    </Form>
  );
};
