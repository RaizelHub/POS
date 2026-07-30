import express from 'express';
import {
  completeDraft,
  deleteDraft,
  getAllDraftsForUser,
  getDraftsForUser,
  upsertDraft,
} from '../Controller/draftOrderController.js';
import { requireAuth, requireSelfOrManager } from '../Middleware/authorize.js';

const router = express.Router();

router.use(requireAuth);
router.get('/drafts/user/:userId', requireSelfOrManager('userId'), getAllDraftsForUser);
router.get('/drafts/:draftType/user/:userId', requireSelfOrManager('userId'), getDraftsForUser);
router.post('/drafts/:draftType', upsertDraft);
router.put('/drafts/:draftType/:draftId', upsertDraft);
router.patch('/drafts/:draftType/:draftId/complete', completeDraft);
router.delete('/drafts/:draftType/:draftId/user/:userId', requireSelfOrManager('userId'), deleteDraft);

export default router;
