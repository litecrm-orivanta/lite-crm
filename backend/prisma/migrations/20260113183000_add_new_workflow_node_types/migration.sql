-- AlterEnum: Add new node types to WorkflowNodeType enum
DO $$ BEGIN
    -- Add new enum values if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'CHATGPT' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'WorkflowNodeType')) THEN
        ALTER TYPE "WorkflowNodeType" ADD VALUE 'CHATGPT';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'WHATSAPP' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'WorkflowNodeType')) THEN
        ALTER TYPE "WorkflowNodeType" ADD VALUE 'WHATSAPP';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'TELEGRAM' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'WorkflowNodeType')) THEN
        ALTER TYPE "WorkflowNodeType" ADD VALUE 'TELEGRAM';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'SLACK' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'WorkflowNodeType')) THEN
        ALTER TYPE "WorkflowNodeType" ADD VALUE 'SLACK';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'SMS' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'WorkflowNodeType')) THEN
        ALTER TYPE "WorkflowNodeType" ADD VALUE 'SMS';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'LOG' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'WorkflowNodeType')) THEN
        ALTER TYPE "WorkflowNodeType" ADD VALUE 'LOG';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'TRANSFORM' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'WorkflowNodeType')) THEN
        ALTER TYPE "WorkflowNodeType" ADD VALUE 'TRANSFORM';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'FILTER' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'WorkflowNodeType')) THEN
        ALTER TYPE "WorkflowNodeType" ADD VALUE 'FILTER';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'LOOP' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'WorkflowNodeType')) THEN
        ALTER TYPE "WorkflowNodeType" ADD VALUE 'LOOP';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'MERGE' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'WorkflowNodeType')) THEN
        ALTER TYPE "WorkflowNodeType" ADD VALUE 'MERGE';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'SPLIT' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'WorkflowNodeType')) THEN
        ALTER TYPE "WorkflowNodeType" ADD VALUE 'SPLIT';
    END IF;
END $$;
