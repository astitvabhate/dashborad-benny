model Campaign {
  id                       String                    @id @default(uuid()) @map("id")
  brandId                  String
  title                    String
  description              String
  platforms                CampaignPlatform[]
  budget                   Decimal                   @db.Decimal(10, 2)
  startDate                DateTime
  endDate                  DateTime
  status                   CampaignStatus            @default(Draft)
  targetAudience           String?
  keyPerformanceIndicators String[]                  @default([])
  callToAction             String?
  createdAt                DateTime                  @default(now())
  updatedAt                DateTime                  @updatedAt
  type                     CampaignType (cliping,logo,ugcc,audiosync)
  sourcePostId             String?
  audioSyncDetails         AudioSyncCampaignDetails?
  campaignAssignments      CampaignAssignment[]
  rules                    CampaignRules?
  brand                    User                      @relation("BrandCampaigns", fields: [brandId], references: [id])
  sourcePost               InstagramPost?            @relation("BrandPostContent", fields: [sourcePostId], references: [id])
  clippingDetails          ClippingCampaignDetails?
  logoDetails              LogoCampaignDetails?
  assets                   MediaAsset[]
  payoutRequests           PayoutRequest[]
  ratings                  Rating[]
  reelSubmissions          ReelSubmission[]
  ugcDetails               UgcCampaignDetails?

  @@map("campaigns")
}
