'use client';

import { toast } from 'sonner';
import { z } from 'zod';

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
import { useRouter } from 'next/navigation';

const LoginAdminSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Password precisa de ter pelo menos 8 caracteres'),
});

type LoginSchema = z.infer<typeof LoginAdminSchema>;
export const LoginForm = () => {
  const router = useRouter();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(LoginAdminSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit({ email, password }: LoginSchema) {
    const response = await signIn('credentials', {
      email,
      password,
      type: 'admin',
      redirect: false,
    });

    if (!response?.ok) {
      toast.error('Password ou email inválidos');
    } else {
      router.push('/admin');
    }
  }

  return (
    <Form {...form}>
      <form className="grid gap-4 py-4" onSubmit={form.handleSubmit(onSubmit)}>
        {/* field mesa */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input {...field} type="password" onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="mt-2"
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
