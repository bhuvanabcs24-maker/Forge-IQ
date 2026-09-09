'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Customer } from '@/types';

const customerSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactName: z.string().min(2, 'Contact person is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Phone number is required'),
  industry: z.string().min(2, 'Industry is required'),
  address: z.string().min(5, 'Address is required'),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export function CreateCustomerModal({
  isOpen,
  onClose,
  onAddCustomer,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomer: (newCust: Customer) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      industry: 'Metal Fabrication',
      address: '',
    },
  });

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success && json.customer) {
        onAddCustomer(json.customer);
        reset();
        onClose();
      } else {
        alert(json.message || 'Failed to register customer');
      }
    } catch (err: any) {
      alert('Error saving customer: ' + err?.message);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Register New Customer" maxWidth="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
            Company / Client Name
          </label>
          <Input placeholder="e.g. Apex Defense Solutions LLC" {...register('companyName')} />
          {errors.companyName && (
            <span className="text-[11px] text-rose-500 mt-1 block">{errors.companyName.message}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
              Primary Contact Person
            </label>
            <Input placeholder="e.g. Robert Vance" {...register('contactName')} />
            {errors.contactName && (
              <span className="text-[11px] text-rose-500 mt-1 block">{errors.contactName.message}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
              Email Address
            </label>
            <Input type="email" placeholder="contact@company.com" {...register('email')} />
            {errors.email && (
              <span className="text-[11px] text-rose-500 mt-1 block">{errors.email.message}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
              Phone Number
            </label>
            <Input placeholder="+91 80 2345 6789" {...register('phone')} />
            {errors.phone && (
              <span className="text-[11px] text-rose-500 mt-1 block">{errors.phone.message}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
              Industry Sector
            </label>
            <Input placeholder="e.g. Aerospace & Defense" {...register('industry')} />
            {errors.industry && (
              <span className="text-[11px] text-rose-500 mt-1 block">{errors.industry.message}</span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
            Plant / Delivery Address
          </label>
          <Input placeholder="e.g. Plot 42, Aerospace SEZ, Devanahalli, Bengaluru" {...register('address')} />
          {errors.address && (
            <span className="text-[11px] text-rose-500 mt-1 block">{errors.address.message}</span>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-steel-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving to Database...' : 'Register Customer'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
