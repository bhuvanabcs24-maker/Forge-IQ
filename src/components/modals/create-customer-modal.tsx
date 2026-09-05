'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
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

  const onSubmit = (data: CustomerFormValues) => {
    onAddCustomer({
      id: `cust-${Date.now()}`,
      companyName: data.companyName,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      industry: data.industry,
      address: data.address,
      status: 'Active',
      totalOrders: 0,
      lifetimeValue: 0,
      createdAt: new Date().toISOString().split('T')[0],
    });
    reset();
    onClose();
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
            <Input placeholder="+1 (555) 000-0000" {...register('phone')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
              Industry Sector
            </label>
            <Select
              options={[
                { label: 'Aerospace & Defense', value: 'Aerospace & Defense' },
                { label: 'Heavy Equipment', value: 'Heavy Equipment' },
                { label: 'Electronics Enclosures', value: 'Electronics Enclosures' },
                { label: 'HVAC Fabrication', value: 'HVAC Fabrication' },
                { label: 'Solar & CleanTech', value: 'Solar & CleanTech' },
                { label: 'Architectural Sheet Metal', value: 'Architectural Sheet Metal' },
              ]}
              {...register('industry')}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
            Facility / Billing Address
          </label>
          <Input placeholder="Street Address, City, State, Zip" {...register('address')} />
          {errors.address && (
            <span className="text-[11px] text-rose-500 mt-1 block">{errors.address.message}</span>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-steel-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            Save Customer Record
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
