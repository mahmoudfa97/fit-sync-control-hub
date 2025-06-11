
-- Add organization_id to tables that don't have it yet
ALTER TABLE custom_member_insurance 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

ALTER TABLE member_files 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

ALTER TABLE member_programs 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

ALTER TABLE member_tasks 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

ALTER TABLE program_exercises 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

ALTER TABLE program_progress 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

ALTER TABLE tracking_programs 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

ALTER TABLE tracking_entries 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

ALTER TABLE files 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

ALTER TABLE access_cards 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

ALTER TABLE user_roles 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

ALTER TABLE checkins 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

ALTER TABLE memberships 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

ALTER TABLE workout_plans 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

ALTER TABLE hyp_payments 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);

-- Update existing records to use the first organization for now (users can reassign later)
UPDATE custom_member_insurance 
SET organization_id = (SELECT id FROM organizations LIMIT 1) 
WHERE organization_id IS NULL;

UPDATE member_files 
SET organization_id = (SELECT id FROM organizations LIMIT 1) 
WHERE organization_id IS NULL;

UPDATE member_programs 
SET organization_id = (SELECT id FROM organizations LIMIT 1) 
WHERE organization_id IS NULL;

UPDATE member_tasks 
SET organization_id = (SELECT id FROM organizations LIMIT 1) 
WHERE organization_id IS NULL;

UPDATE program_exercises 
SET organization_id = (SELECT id FROM organizations LIMIT 1) 
WHERE organization_id IS NULL;

UPDATE program_progress 
SET organization_id = (SELECT id FROM organizations LIMIT 1) 
WHERE organization_id IS NULL;

UPDATE tracking_programs 
SET organization_id = (SELECT id FROM organizations LIMIT 1) 
WHERE organization_id IS NULL;

UPDATE tracking_entries 
SET organization_id = (SELECT id FROM organizations LIMIT 1) 
WHERE organization_id IS NULL;

UPDATE tasks 
SET organization_id = (SELECT id FROM organizations LIMIT 1) 
WHERE organization_id IS NULL;

UPDATE files 
SET organization_id = (SELECT id FROM organizations LIMIT 1) 
WHERE organization_id IS NULL;

UPDATE access_cards 
SET organization_id = (SELECT id FROM organizations LIMIT 1) 
WHERE organization_id IS NULL;

UPDATE user_roles 
SET organization_id = (SELECT id FROM organizations LIMIT 1) 
WHERE organization_id IS NULL;

UPDATE checkins 
SET organization_id = (SELECT id FROM organizations LIMIT 1) 
WHERE organization_id IS NULL;

UPDATE memberships 
SET organization_id = (SELECT id FROM organizations LIMIT 1) 
WHERE organization_id IS NULL;

UPDATE workout_plans 
SET organization_id = (SELECT id FROM organizations LIMIT 1) 
WHERE organization_id IS NULL;

UPDATE hyp_payments 
SET organization_id = (SELECT id FROM organizations LIMIT 1) 
WHERE organization_id IS NULL;
