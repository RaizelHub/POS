import express from 'express';
import {
  completeDraft,
  deleteDraft,
  getAllDraftsForUser,
  getDraftsForUser,
  upsertDraft,
} from '../Controller/draftOrderController.js';

const router = express.Router();

router.get('/drafts/user/:userId', getAllDraftsForUser);
router.get('/drafts/:draftType/user/:userId', getDraftsForUser);
router.post('/drafts/:draftType', upsertDraft);
router.put('/drafts/:draftType/:draftId', upsertDraft);
router.patch('/drafts/:draftType/:draftId/complete', completeDraft);
router.delete('/drafts/:draftType/:draftId/user/:userId', deleteDraft);

export default router;
