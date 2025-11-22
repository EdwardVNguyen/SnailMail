import { processEmailQueue } from '../controllers/processEmailQueueController.js';

// Process email queue every 15 seconds
const EMAIL_PROCESS_INTERVAL = 15000; // 15 seconds

let isProcessing = false;

const startEmailWorker = () => {
  console.log('Email worker started - checking queue every 30 seconds');

  setInterval(async () => {
    // Prevent overlapping processes
    if (isProcessing) {
      console.log('Email worker already processing, skipping...');
      return;
    }

    isProcessing = true;

    try {
      const result = await processEmailQueue();
      
      if (result.processed > 0) {
        console.log(`Processed ${result.processed} emails: ${result.successful} sent, ${result.failed} failed`);
      }
    } catch (error) {
      console.error('Email worker error:', error);
    } finally {
      isProcessing = false;
    }
  }, EMAIL_PROCESS_INTERVAL);
};

export default startEmailWorker;