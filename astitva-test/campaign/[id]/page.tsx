import { mockCampaign } from "@/mock/campaign";

export default function CampaignDashboard() {
  const campaign = mockCampaign;
  const spentPercent = Math.round(
    (campaign.spent / campaign.budget) * 100
  );

  return (
    <div className="p-6 space-y-8">
      {/* HERO */}
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">
            {campaign.title}
          </h1>

          <div className="mt-2 flex gap-2">
            <Badge>{campaign.type.toUpperCase()}</Badge>
            <StatusBadge status={campaign.status} />
          </div>

          <p className="mt-2 text-sm text-gray-500">
            {campaign.startDate} → {campaign.endDate}
          </p>
        </div>

        {/* Budget Ring */}
        <div className="relative w-28 h-28">
          <div className="absolute inset-0 rounded-full border-8 border-gray-200" />
          <div
            className="absolute inset-0 rounded-full border-8 border-blue-500"
            style={{
              clipPath: `inset(${100 - spentPercent}% 0 0 0)`,
            }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold">
              {spentPercent}%
            </span>
            <span className="text-xs text-gray-500">Spent</span>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Applied" value={campaign.stats.appliedCreators} />
        <StatCard label="Selected" value={campaign.stats.selectedCreators} />
        <StatCard label="Live" value={campaign.stats.liveCreators} />
        <StatCard label="Submissions" value={campaign.stats.submissions} />
        <StatCard label="Pending Payouts" value={campaign.stats.pendingPayouts} />
      </section>
    </div>
  );
}
