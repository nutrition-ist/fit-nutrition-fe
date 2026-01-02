import FeatureRow, { FeatureRowProps } from "@/components/FeatureRow";
import { Box, Container, Typography } from "@mui/material";

const FEATURES: FeatureRowProps[] = [
  {
    title: "Smart Meal Planning Tools",
    description:
      "Create custom meal plans in minutes using a searchable database of over 8,000 dietitian‑approved recipes. Automatically adjust for allergies, macros, and nutritional goals.",
    img: "/images/SmartMealPlanning.png",
  },
  {
    title: "Integrated Consultation Booking",
    description:
      "Let clients schedule directly from your profile. Sync with Google or Outlook Calendars. Reduce no‑shows with automated reminders and client‑friendly time slots.",
    img: "/images/ConsultationBooking.png",
  },
  {
    title: "Client Management Dashboard",
    description:
      "Securely store session notes, track client progress, and access full dietary history in one place. GDPR and HIPAA compliant.",
    img: "/images/ClientManagement.png",
  },
  {
    title: "Recipe Library with Nutrition Facts",
    description:
      "Access or upload high‑quality recipes with full macro and micronutrient breakdowns. Filter by dietary needs, cooking time, or caloric range.",
    img: "/images/RecipeLibrary.png",
  },
  {
    title: "Built for Collaboration",
    description:
      "Invite team members, interns, or co‑dietitians with tiered access permissions. Seamless communication and shared notes make team‑based care easier than ever.",
    img: "/images/BuiltForCollaboration.png",
  },
  {
    title: "Real‑Time Progress Tracking",
    description:
      "Clients can log meals, habits, and health metrics via the app. View trends and generate progress reports instantly to personalize follow‑ups.",
    img: "/images/RealTimeProgress.png",
  },
];

const FeatureSection: React.FC = () => (
  <Box sx={{ bgcolor: "#e6f1ef", py: { xs: 8, md: 10 } }}>
    <Container maxWidth="lg">
      {/* Section heading */}
      <Typography
        variant="h4"
        component="h2"
        align="center"
        sx={{ fontWeight: 700, mb: 3 }}
      >
        All‑in‑One Nutrition Software for Dietitians
      </Typography>

      {/* Subtitle */}
      <Typography
        variant="h6"
        align="center"
        sx={{ mb: { xs: 8, md: 10 }, maxWidth: 900, mx: "auto" }}
      >
        Manage your entire practice with a powerful, intuitive platform currently being designed for nutrition professionals. Whether you&apos;re running a clinic or offering remote consultations, our features are built to simplify your day and amplify client results.
      </Typography>

      {/* Alternating feature rows */}
      {FEATURES.map((f, idx) => (
        <FeatureRow key={f.title} {...f} reverse={idx % 2 === 1} /> //every second one, will reverse
      ))}
    </Container>
  </Box>
);

export default FeatureSection;
