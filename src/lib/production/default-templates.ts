import { WorkflowTemplate } from '@/types/production-planner';

export const FABRICATION_WORKFLOW_TEMPLATE: WorkflowTemplate = {
  id: 'tmpl-fabrication-default',
  industry: 'Fabrication',
  name: 'Standard Sheet Metal & Fabrication Workflow',
  description: '9-stage shop floor process covering material staging, laser cutting, CNC bending, welding, finishing, and QC.',
  isDefault: true,
  stages: [
    { id: 'material_ready', name: 'Material Ready', description: 'Raw sheet stock reserved & staged in rack', color: '#64748B', orderIndex: 0 },
    { id: 'scheduled', name: 'Scheduled', description: 'Queued on machine dispatch board', color: '#8B5CF6', orderIndex: 1 },
    { id: 'laser_cutting', name: 'Laser Cutting', description: 'Active nesting & fiber laser cutting', color: '#2563EB', orderIndex: 2 },
    { id: 'bending', name: 'CNC Bending', description: 'Precision brake press forming', color: '#3B82F6', orderIndex: 3 },
    { id: 'welding', name: 'MIG / TIG Welding', description: 'Structural welding & robotic cell assembly', color: '#0EA5E9', orderIndex: 4 },
    { id: 'finishing', name: 'Powder Coating', description: 'Surface deburring & powder coat line', color: '#EC4899', orderIndex: 5 },
    { id: 'quality_check', name: 'Quality Assurance', description: 'Dimensional & CMM inspection', color: '#F59E0B', orderIndex: 6 },
    { id: 'dispatch', name: 'Ready for Dispatch', description: 'Packaged & palletized for shipping', color: '#10B981', orderIndex: 7 },
    { id: 'completed', name: 'Job Completed', description: 'Delivered to client & closed', color: '#059669', orderIndex: 8 },
  ],
};

export const ELECTRICAL_PANEL_WORKFLOW_TEMPLATE: WorkflowTemplate = {
  id: 'tmpl-electrical-default',
  industry: 'Electrical',
  name: 'Electrical Enclosure & Busbar Assembly',
  description: 'Stage pipeline for NEMA enclosure fabrication, busbar punching, wiring, and dielectric testing.',
  stages: [
    { id: 'material_ready', name: 'Enclosure Staging', description: 'Sheet metal enclosure ready', color: '#64748B', orderIndex: 0 },
    { id: 'busbar_punch', name: 'Busbar Punching', description: 'Copper busbar cutting & punching', color: '#2563EB', orderIndex: 1 },
    { id: 'wiring', name: 'Harness Wiring', description: 'Internal component wiring & crimping', color: '#8B5CF6', orderIndex: 2 },
    { id: 'dielectric_qc', name: 'High-Pot QC Test', description: 'Dielectric insulation testing', color: '#F59E0B', orderIndex: 3 },
    { id: 'dispatch', name: 'Ready for Shipping', description: 'Packaged with wiring diagrams', color: '#10B981', orderIndex: 4 },
  ],
};

export const ALL_WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  FABRICATION_WORKFLOW_TEMPLATE,
  ELECTRICAL_PANEL_WORKFLOW_TEMPLATE,
];
