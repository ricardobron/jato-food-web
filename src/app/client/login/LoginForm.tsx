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
import { useEffect } from 'react';

const LoginClientSchema = z.object({
  mesa: z
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
  code: z
    .string()
    .min(4, { message: 'Tem de ter pelo menos 4 caracteres' })
    .max(8, { message: 'Só pode ter no máximo 8 caracteres' }),
});

type LoginSchema = z.infer<typeof LoginClientSchema>;
export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const _mesa = searchParams.get('mesa');

  const form = useForm<LoginSchema>({
    resolver: zodResolver(LoginClientSchema),
    defaultValues: {
      mesa: _mesa ? Number(_mesa) : 0,
      phone_number: '',
      code: '',
    },
  });

  const mesaForm = form.watch('mesa');

  useEffect(() => {
    if (mesaForm) {
      localStorage.setItem('@JATO:FOOD:TABLE', String(mesaForm));
    }
  }, [mesaForm]);

  async function onSubmit({ code, phone_number, mesa }: LoginSchema) {
    if (!mesa) {
      return toast.warning('Mesa não definida', {
        description: 'Tente ler o código QRCode de novo',
        duration: 8000,
      });
    }

    const response = await signIn('credentials', {
      code,
      phone_number,
      type: 'client',
      redirect: false,
    });

    if (!response?.ok) {
      toast.error('Número de telemóvel ou código inválidos');
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
          name="mesa"
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
          name="code"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Código (à sua escolha) (*)</FormLabel>
              <FormControl>
                <Input type="password" {...field} onChange={field.onChange} />
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
