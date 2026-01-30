const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  makeOffer,
  getOffersForAuction,
  getMyOfferForAuction,
  acceptOffer,
  rejectOffer
} = require("../controllers/offer");

router.post("/", auth, makeOffer);
router.get("/:auctionId/my", auth, getMyOfferForAuction); // 👈 NEW
router.get("/:auctionId", auth, getOffersForAuction);
router.post("/:offerId/accept", auth, acceptOffer);
router.post("/:offerId/reject", auth, rejectOffer);


module.exports = router;
