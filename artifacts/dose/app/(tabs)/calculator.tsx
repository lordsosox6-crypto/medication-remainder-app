import React, { useMemo, useState } from "react";
import {
  Pressable,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import Colors from "@/constants/colors";
import { t } from "@/constants/i18n";
import { useApp } from "@/context/AppContext";

type DoseEntry = {
  id: string;
  name: string;
  category: "Injections/Infusions" | "Syrups/Suspensions" | "Drops" | "Tablets/Capsules";
  concentration?: string;
  dose: string;
  frequency: string;
  unit?: string;
  multiplier?: number;
  minMultiplier?: number;
  maxMultiplier?: number;
  fixed?: string;
  notes?: string;
};

const DOSE_ENTRIES: DoseEntry[] = [
  { id: "diazepam-iv", name: "Diazepam injection IV", category: "Injections/Infusions", concentration: "10mg/2ml", dose: "0.3mg/kg/dose", frequency: "Maximum 2 times", unit: "mg", multiplier: 0.3 },
  { id: "diazepam-rectal", name: "Diazepam rectal", category: "Injections/Infusions", concentration: "10mg/2ml", dose: "0.5mg/kg/dose", frequency: "Maximum 2 times", unit: "mg", multiplier: 0.5 },
  { id: "phenytoin-load", name: "Phenytoin loading dose", category: "Injections/Infusions", concentration: "250mg/5ml", dose: "15-20mg/kg", frequency: "Now, slow IV in 50ml NS over 1/2 to 1 hour", unit: "mg", minMultiplier: 15, maxMultiplier: 20 },
  { id: "phenytoin-maint", name: "Phenytoin maintenance", category: "Injections/Infusions", concentration: "250mg/5ml", dose: "5mg/kg/day", frequency: "After 12 hours from loading dose, BD", unit: "mg/day", multiplier: 5 },
  { id: "midazolam-load", name: "Midazolam IV loading", category: "Injections/Infusions", concentration: "1mg/1ml", dose: "0.2mg/kg", frequency: "Now", unit: "mg", multiplier: 0.2 },
  { id: "midazolam-maint", name: "Midazolam IV maintenance", category: "Injections/Infusions", concentration: "1mg/1ml", dose: "0.02mg/kg", frequency: "Maintenance dose", unit: "mg", multiplier: 0.02 },
  { id: "chlorpheniramine", name: "Antihistamine / Chlorpheniramine", category: "Injections/Infusions", concentration: "10mg/1ml", dose: "Wt x 0.1", frequency: "As required", unit: "ml", multiplier: 0.1, notes: "Less than 2 years: 2-5mg; 2-5 years: 5mg; more than 5 years: 10mg" },
  { id: "dexamethasone-meningitis", name: "Dexamethasone meningitis", category: "Injections/Infusions", concentration: "4mg/1ml", dose: "0.15mg/kg", frequency: "6 hourly for 24 hours", unit: "mg", multiplier: 0.15 },
  { id: "dexamethasone-croup", name: "Dexamethasone croup", category: "Injections/Infusions", concentration: "4mg/1ml", dose: "0.6mg/kg IM", frequency: "Single dose", unit: "mg", multiplier: 0.6 },
  { id: "adrenaline-anaphylaxis", name: "Adrenaline 1:1000 anaphylaxis", category: "Injections/Infusions", concentration: "1mg/1ml", dose: "Wt x 0.01", frequency: "As required", unit: "ml", multiplier: 0.01 },
  { id: "adrenaline-cpr", name: "Adrenaline 1:10,000 CPR", category: "Injections/Infusions", concentration: "1mg/1ml", dose: "Wt x 0.1", frequency: "As required", unit: "ml", multiplier: 0.1 },
  { id: "hydrocortisone", name: "Hydrocortisone injection", category: "Injections/Infusions", concentration: "100mg", dose: "5mg/kg/dose", frequency: "6 hourly", unit: "mg", multiplier: 5 },
  { id: "lasix-inj", name: "Lasix injection", category: "Injections/Infusions", concentration: "20mg/2ml", dose: "1-2mg/kg/day", frequency: "TDS or BD", unit: "mg/day", minMultiplier: 1, maxMultiplier: 2 },
  { id: "ondansetron", name: "Ondansetron slow IV", category: "Injections/Infusions", concentration: "4mg/1ml or 8mg/2ml", dose: "0.1mg/kg/dose", frequency: "TDS", unit: "mg", multiplier: 0.1 },
  { id: "calcium-gluconate-load", name: "Calcium gluconate 10% loading", category: "Injections/Infusions", dose: "2ml/kg", frequency: "Now, diluted in D5% 1:4 over 1/2 to 1 hour", unit: "ml", multiplier: 2 },
  { id: "calcium-gluconate-maint", name: "Calcium gluconate 10% maintenance", category: "Injections/Infusions", dose: "5-7ml/kg", frequency: "Over 24 hours", unit: "ml", minMultiplier: 5, maxMultiplier: 7 },
  { id: "paracetamol-iv", name: "Paracetamol IV infusion", category: "Injections/Infusions", concentration: "1g/100ml", dose: "Wt x 1-1.5ml", frequency: "6 hourly for 24 hours then PRN", unit: "ml", minMultiplier: 1, maxMultiplier: 1.5 },
  { id: "diclofenac-im", name: "Diclofenac sodium IM", category: "Injections/Infusions", concentration: "75mg/3ml", dose: "1mg/kg", frequency: "TDS or BD", unit: "mg", multiplier: 1, notes: "For babies older than 6 months" },
  { id: "ampicillin-inj", name: "Ampicillin injection", category: "Injections/Infusions", concentration: "500mg", dose: "25mg/kg/dose", frequency: "6 hourly or TDS", unit: "mg", multiplier: 25 },
  { id: "gentamycin-dose", name: "Gentamycin injection per dose", category: "Injections/Infusions", concentration: "80mg/2ml or 40mg/1ml", dose: "2.5mg/kg/dose", frequency: "TDS", unit: "mg", multiplier: 2.5 },
  { id: "gentamycin-day", name: "Gentamycin injection daily", category: "Injections/Infusions", concentration: "80mg/2ml or 40mg/1ml", dose: "7.5mg/kg/day", frequency: "OD", unit: "mg/day", multiplier: 7.5 },
  { id: "vancomycin", name: "Vancomycin IV", category: "Injections/Infusions", concentration: "500mg/1g", dose: "10-15mg/kg/dose", frequency: "BD or TDS", unit: "mg", minMultiplier: 10, maxMultiplier: 15 },
  { id: "artesunate-small", name: "Artesunate less than 20kg", category: "Injections/Infusions", concentration: "30mg/60mg/120mg", dose: "3mg/kg", frequency: "Every 12 hours for 3 doses then 24 hourly to complete 7 doses", unit: "mg", multiplier: 3 },
  { id: "artesunate-large", name: "Artesunate more than 20kg", category: "Injections/Infusions", concentration: "30mg/60mg/120mg", dose: "2.4mg/kg", frequency: "Every 12 hours for 3 doses then 24 hourly to complete 7 doses", unit: "mg", multiplier: 2.4 },
  { id: "quinine-inj", name: "Quinine injection IV", category: "Injections/Infusions", concentration: "600mg/2ml", dose: "10mg/kg/dose", frequency: "TDS", unit: "mg", multiplier: 10 },
  { id: "acyclovir-inj", name: "Acyclovir injection IV", category: "Injections/Infusions", concentration: "250mg", dose: "10mg/kg/dose", frequency: "TDS for 7 days", unit: "mg", multiplier: 10 },
  { id: "cefotaxime", name: "Cefotaxime injection", category: "Injections/Infusions", concentration: "500mg/1g", dose: "50mg/kg/dose", frequency: "TDS", unit: "mg", multiplier: 50 },
  { id: "cefotaxime-meningitis", name: "Cefotaxime meningitis", category: "Injections/Infusions", concentration: "500mg/1g", dose: "100mg/kg/dose", frequency: "BD in neonate", unit: "mg", multiplier: 100 },
  { id: "ceftriaxone", name: "Ceftriaxone IV", category: "Injections/Infusions", concentration: "500mg/1g", dose: "50mg/kg/dose", frequency: "OD, BD if dose is more than 1g", unit: "mg", multiplier: 50 },
  { id: "ceftriaxone-sca", name: "Ceftriaxone in SCA", category: "Injections/Infusions", concentration: "500mg/1g", dose: "80mg/kg/dose", frequency: "OD", unit: "mg", multiplier: 80 },
  { id: "ceftriaxone-meningitis", name: "Ceftriaxone meningitis", category: "Injections/Infusions", concentration: "500mg/1g", dose: "100mg/kg/dose", frequency: "Infuse in 100ml D5% + 1/2 NS over 1/2 to 1 hour", unit: "mg", multiplier: 100 },
  { id: "cefuroxime-inj", name: "Cefuroxime injection", category: "Injections/Infusions", concentration: "750mg/1.5g", dose: "30mg/kg/dose", frequency: "TDS", unit: "mg", multiplier: 30 },
  { id: "ceftazidime", name: "Ceftazidime injection", category: "Injections/Infusions", concentration: "500mg/1g", dose: "30-50mg/kg/dose", frequency: "BD or TDS", unit: "mg", minMultiplier: 30, maxMultiplier: 50 },
  { id: "aminophylline-load", name: "Aminophylline loading", category: "Injections/Infusions", concentration: "25mg/1ml", dose: "5mg/kg", frequency: "Now direct", unit: "mg", multiplier: 5 },
  { id: "aminophylline-maint", name: "Aminophylline maintenance", category: "Injections/Infusions", concentration: "25mg/1ml", dose: "2mg/kg", frequency: "Every 12 hours in 20ml NS over 1/2 to 1 hour", unit: "mg", multiplier: 2 },
  { id: "magnesium-sulphate", name: "Magnesium sulphate injection", category: "Injections/Infusions", dose: "25-50mg/kg/dose", frequency: "As directed", unit: "mg", minMultiplier: 25, maxMultiplier: 50 },
  { id: "metronidazole-iv", name: "Metronidazole IV infusion", category: "Injections/Infusions", dose: "7.5mg/kg/dose", frequency: "TDS", unit: "mg", multiplier: 7.5 },
  { id: "streptomycin", name: "Streptomycin injection", category: "Injections/Infusions", dose: "40mg/kg/day", frequency: "OD", unit: "mg/day", multiplier: 40 },
  { id: "morphine", name: "Morphine injection IM/SC", category: "Injections/Infusions", concentration: "10mg/1ml", dose: "0.1-0.2mg/kg/dose", frequency: "OD", unit: "mg", minMultiplier: 0.1, maxMultiplier: 0.2 },
  { id: "meropenem", name: "Meropenem IV", category: "Injections/Infusions", concentration: "500mg/1g", dose: "20mg/kg/dose", frequency: "TDS", unit: "mg", multiplier: 20 },
  { id: "meropenem-meningitis", name: "Meropenem meningitis", category: "Injections/Infusions", concentration: "500mg/1g", dose: "40mg/kg/dose", frequency: "TDS", unit: "mg", multiplier: 40 },
  { id: "amikacin", name: "Amikacin injection IV", category: "Injections/Infusions", concentration: "500mg/2ml", dose: "10mg/kg/day", frequency: "As directed", unit: "mg/day", multiplier: 10 },
  { id: "paracetamol-syrup", name: "Paracetamol syrup 120mg", category: "Syrups/Suspensions", dose: "Wt x 0.4 or Wt / 2", frequency: "4 to 6 hourly", unit: "ml", multiplier: 0.4, notes: "The file also lists Wt / 2 as an alternative." },
  { id: "mefenamic-syrup", name: "Mefenamic acid syrup 50mg", category: "Syrups/Suspensions", dose: "(Wt / 2) + 1ml", frequency: "TDS", unit: "ml", multiplier: 0.5, notes: "Add 1ml to the calculated value. For baby older than 6 months." },
  { id: "ibuprofen-syrup", name: "Ibuprofen syrup 100mg", category: "Syrups/Suspensions", dose: "Wt / 2", frequency: "6 to 8 hourly", unit: "ml", multiplier: 0.5 },
  { id: "balsam-cough", name: "Balsam cough syrup", category: "Syrups/Suspensions", dose: "Wt / 4", frequency: "TDS for 5 days", unit: "ml", multiplier: 0.25 },
  { id: "amoxicillin-125", name: "Amoxicillin syrup 125mg", category: "Syrups/Suspensions", dose: "Wt / 2", frequency: "TDS for 7 days", unit: "ml", multiplier: 0.5 },
  { id: "amoxicillin-250", name: "Amoxicillin syrup 250mg", category: "Syrups/Suspensions", dose: "Wt / 4", frequency: "TDS for 7 days", unit: "ml", multiplier: 0.25 },
  { id: "amoclan-200", name: "Amoclan syrup 200mg", category: "Syrups/Suspensions", dose: "Wt / 2", frequency: "BD for 7 days", unit: "ml", multiplier: 0.5 },
  { id: "amoclan-400", name: "Amoclan syrup 400mg", category: "Syrups/Suspensions", dose: "Wt / 4", frequency: "BD for 7 days", unit: "ml", multiplier: 0.25 },
  { id: "ampiclox", name: "Ampiclox 250mg suspension", category: "Syrups/Suspensions", dose: "Wt / 4", frequency: "6 hourly for 7 days", unit: "ml", multiplier: 0.25 },
  { id: "azithromycin-susp", name: "Azithromycin 200mg suspension", category: "Syrups/Suspensions", dose: "Wt / 4", frequency: "OD for 3 days", unit: "ml", multiplier: 0.25 },
  { id: "clarithromycin-125", name: "Clarithromycin syrup 125mg", category: "Syrups/Suspensions", dose: "Wt x 0.6", frequency: "BD for 7 days", unit: "ml", multiplier: 0.6 },
  { id: "clarithromycin-250", name: "Clarithromycin syrup 250mg", category: "Syrups/Suspensions", dose: "Wt x 0.3", frequency: "BD for 7 days", unit: "ml", multiplier: 0.3 },
  { id: "cefixime-susp", name: "Cefixime 100mg suspension", category: "Syrups/Suspensions", dose: "Wt x 0.4", frequency: "OD or BD for 6 days", unit: "ml", multiplier: 0.4 },
  { id: "salbutamol-syrup", name: "Salbutamol syrup 2mg", category: "Syrups/Suspensions", dose: "Wt x 0.3", frequency: "TDS", unit: "ml", multiplier: 0.3 },
  { id: "metronidazole-syrup", name: "Metronidazole syrup 200mg", category: "Syrups/Suspensions", dose: "7.5mg/kg/dose, 1ml=40mg", frequency: "TDS for 7 days", unit: "mg", multiplier: 7.5 },
  { id: "acyclovir-syrup", name: "Acyclovir syrup 200mg", category: "Syrups/Suspensions", dose: "Wt / 4", frequency: "TDS for 7 days", unit: "ml", multiplier: 0.25 },
  { id: "domperidone-syrup", name: "Domperidone syrup", category: "Syrups/Suspensions", dose: "Wt / 4", frequency: "TDS", unit: "ml", multiplier: 0.25 },
  { id: "paracetamol-tabs", name: "Paracetamol tablets", category: "Tablets/Capsules", concentration: "250mg or 500mg", dose: "10-15mg/kg/dose", frequency: "6 hourly then PRN", unit: "mg", minMultiplier: 10, maxMultiplier: 15 },
  { id: "ibuprofen-tabs", name: "Ibuprofen tablets", category: "Tablets/Capsules", concentration: "200mg or 400mg", dose: "10mg/kg/dose", frequency: "BD or TDS", unit: "mg", multiplier: 10 },
  { id: "amoxicillin-caps", name: "Amoxicillin capsules", category: "Tablets/Capsules", concentration: "250mg or 500mg", dose: "80mg/kg/day", frequency: "TDS for 5 or 7 days", unit: "mg/day", multiplier: 80 },
  { id: "azithromycin-tabs", name: "Azithromycin tablets/capsules", category: "Tablets/Capsules", concentration: "250mg or 500mg", dose: "10mg/kg/dose", frequency: "OD for 3 or 5 days", unit: "mg", multiplier: 10 },
  { id: "cefixime-caps", name: "Cefixime capsules", category: "Tablets/Capsules", concentration: "200mg or 400mg", dose: "8mg/kg/dose", frequency: "OD for 5 or 6 days", unit: "mg", multiplier: 8 },
  { id: "acyclovir-tabs", name: "Acyclovir tablets", category: "Tablets/Capsules", concentration: "200mg or 400mg", dose: "20mg/kg/dose", frequency: "TDS for 5 to 7 days", unit: "mg", multiplier: 20 },
  { id: "metronidazole-tabs", name: "Metronidazole tablets", category: "Tablets/Capsules", concentration: "250mg or 500mg", dose: "7.5mg/kg/dose", frequency: "TDS for 5 to 10 days", unit: "mg", multiplier: 7.5 },
  { id: "omeprazole-tabs", name: "Omeprazole tablets", category: "Tablets/Capsules", concentration: "20mg or 40mg", dose: "1mg/kg/dose", frequency: "OD on empty stomach or before meal by half an hour", unit: "mg", multiplier: 1 },
  { id: "phenobarbitone-load", name: "Phenobarbitone loading", category: "Tablets/Capsules", concentration: "30mg", dose: "15-20mg/kg", frequency: "Loading dose", unit: "mg", minMultiplier: 15, maxMultiplier: 20 },
  { id: "phenobarbitone-maint", name: "Phenobarbitone maintenance", category: "Tablets/Capsules", concentration: "30mg", dose: "5mg/kg/day", frequency: "BD then adjusted according to response", unit: "mg/day", multiplier: 5 },
  { id: "hydroxyurea", name: "Hydroxyurea capsules", category: "Tablets/Capsules", concentration: "500mg", dose: "15-20mg/kg", frequency: "OD then increased according to response", unit: "mg", minMultiplier: 15, maxMultiplier: 20, notes: "Described first by specialist" },
];

const categories = ["All", "Injections/Infusions", "Syrups/Suspensions", "Drops", "Tablets/Capsules"] as const;

function formatDose(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function calculateDose(entry: DoseEntry, weight: number): string {
  if (entry.fixed) return entry.fixed;
  if (!weight || weight <= 0 || !entry.unit) return "";
  if (entry.minMultiplier !== undefined && entry.maxMultiplier !== undefined) {
    return `${formatDose(weight * entry.minMultiplier)} - ${formatDose(weight * entry.maxMultiplier)} ${entry.unit}`;
  }
  if (entry.multiplier !== undefined) {
    const base = weight * entry.multiplier;
    const adjusted = entry.id === "mefenamic-syrup" ? base + 1 : base;
    return `${formatDose(adjusted)} ${entry.unit}`;
  }
  return "";
}

export default function CalculatorScreen() {
  const { settings, isDark } = useApp();
  const C = isDark ? Colors.dark : Colors.light;
  const lang = settings.language;
  const isRTL = lang === "ar";
  const insets = useSafeAreaInsets();
  const fontBold = isRTL ? "Tajawal_700Bold" : "Inter_700Bold";
  const fontMed = isRTL ? "Tajawal_500Medium" : "Inter_500Medium";
  const fontReg = isRTL ? "Tajawal_400Regular" : "Inter_400Regular";
  const webTopPadding = Platform.OS === "web" ? 67 : 0;
  const [weightText, setWeightText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [selectedId, setSelectedId] = useState(DOSE_ENTRIES[0].id);
  const weight = Number.parseFloat(weightText.replace(",", "."));
  const selected = DOSE_ENTRIES.find((entry) => entry.id === selectedId) ?? DOSE_ENTRIES[0];

  const filteredEntries = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return DOSE_ENTRIES.filter((entry) => {
      const matchesCategory = category === "All" || entry.category === category;
      const matchesSearch = !query || entry.name.toLowerCase().includes(query) || entry.dose.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [category, searchText]);

  const result = calculateDose(selected, weight);

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View
        style={[
          styles.pageHeader,
          {
            backgroundColor: C.surface,
            paddingTop: insets.top + 16 + webTopPadding,
            borderBottomColor: C.border,
          },
        ]}
      >
        <Text style={[styles.pageTitle, { color: C.text, fontFamily: fontBold }]}>
          {t("doseCalculatorTitle", lang)}
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 150 },
          isRTL && { direction: "rtl" },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { backgroundColor: C.surface, borderColor: C.border }, isRTL && styles.rowReverse]}>
          <View style={[styles.headerIcon, { backgroundColor: C.primaryLight }]}>
            <MaterialCommunityIcons name="calculator-variant-outline" size={28} color={C.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.subtitle, { color: C.textSecondary, fontFamily: fontReg, textAlign: isRTL ? "right" : "left" }]}>
              {t("medicalWarning", lang)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: C.textMuted, fontFamily: fontMed, textAlign: isRTL ? "right" : "left" }]}>
            {t("weightKg", lang)}
          </Text>
          <TextInput
            value={weightText}
            onChangeText={setWeightText}
            placeholder={t("weightPlaceholder", lang)}
            placeholderTextColor={C.textMuted}
            keyboardType="decimal-pad"
            style={[
              styles.input,
              {
                backgroundColor: C.surface,
                borderColor: C.border,
                color: C.text,
                fontFamily: fontReg,
                textAlign: isRTL ? "right" : "left",
              },
            ]}
          />
        </View>

        <View style={[styles.resultCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.resultLabel, { color: C.textMuted, fontFamily: fontMed, textAlign: isRTL ? "right" : "left" }]}>
            {t("calculatedDose", lang)}
          </Text>
          <Text style={[styles.resultValue, { color: result ? C.primary : C.textMuted, fontFamily: fontBold, textAlign: isRTL ? "right" : "left" }]}>
            {result || t("noCalculation", lang)}
          </Text>
          <View style={styles.detailGrid}>
            <Detail label={t("sourceDose", lang)} value={selected.dose} C={C} fontMed={fontMed} fontReg={fontReg} isRTL={isRTL} />
            <Detail label={t("frequency", lang)} value={selected.frequency} C={C} fontMed={fontMed} fontReg={fontReg} isRTL={isRTL} />
            {!!selected.concentration && (
              <Detail label={t("concentration", lang)} value={selected.concentration} C={C} fontMed={fontMed} fontReg={fontReg} isRTL={isRTL} />
            )}
            {!!selected.notes && (
              <Detail label={t("notes", lang)} value={selected.notes} C={C} fontMed={fontMed} fontReg={fontReg} isRTL={isRTL} />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: C.textMuted, fontFamily: fontMed, textAlign: isRTL ? "right" : "left" }]}>
            {t("selectMedicine", lang)}
          </Text>
          <View style={[styles.searchBox, { backgroundColor: C.surface, borderColor: C.border }, isRTL && styles.rowReverse]}>
            <Feather name="search" size={18} color={C.textMuted} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder={t("searchDrug", lang)}
              placeholderTextColor={C.textMuted}
              style={[styles.searchInput, { color: C.text, fontFamily: fontReg, textAlign: isRTL ? "right" : "left" }]}
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
            {categories.map((item) => {
              const active = category === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={[
                    styles.categoryChip,
                    { backgroundColor: active ? C.primary : C.surface, borderColor: active ? C.primary : C.border },
                  ]}
                >
                  <Text style={[styles.categoryText, { color: active ? "#07120f" : C.textSecondary, fontFamily: fontMed }]}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.list}>
          {filteredEntries.map((entry) => {
            const active = entry.id === selected.id;
            return (
              <Pressable
                key={entry.id}
                onPress={() => setSelectedId(entry.id)}
                style={[
                  styles.drugCard,
                  {
                    backgroundColor: active ? C.primaryLight : C.surface,
                    borderColor: active ? C.primary : C.border,
                  },
                ]}
              >
                <View style={[styles.drugHeader, isRTL && styles.rowReverse]}>
                  <Text style={[styles.drugName, { color: C.text, fontFamily: fontBold, textAlign: isRTL ? "right" : "left" }]}>
                    {entry.name}
                  </Text>
                  {active && <Feather name="check-circle" size={20} color={C.primary} />}
                </View>
                <Text style={[styles.drugMeta, { color: C.textSecondary, fontFamily: fontReg, textAlign: isRTL ? "right" : "left" }]}>
                  {entry.dose} · {entry.frequency}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function Detail({
  label,
  value,
  C,
  fontMed,
  fontReg,
  isRTL,
}: {
  label: string;
  value: string;
  C: typeof Colors.light;
  fontMed: string;
  fontReg: string;
  isRTL: boolean;
}) {
  return (
    <View style={[styles.detailItem, { backgroundColor: C.surfaceSecondary }]}>
      <Text style={[styles.detailLabel, { color: C.textMuted, fontFamily: fontMed, textAlign: isRTL ? "right" : "left" }]}>
        {label}
      </Text>
      <Text style={[styles.detailValue, { color: C.text, fontFamily: fontReg, textAlign: isRTL ? "right" : "left" }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  pageHeader: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  pageTitle: { fontSize: 28, letterSpacing: -0.5, textAlign: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
  },
  rowReverse: { flexDirection: "row-reverse" },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1, gap: 4 },
  subtitle: { fontSize: 13, lineHeight: 19 },
  section: { gap: 10 },
  sectionLabel: { fontSize: 13, textTransform: "uppercase", letterSpacing: 0.6 },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
  },
  resultCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },
  resultLabel: { fontSize: 13, textTransform: "uppercase", letterSpacing: 0.6 },
  resultValue: { fontSize: 30, letterSpacing: -0.8 },
  detailGrid: { gap: 8 },
  detailItem: { borderRadius: 14, padding: 12, gap: 4 },
  detailLabel: { fontSize: 12 },
  detailValue: { fontSize: 14, lineHeight: 20 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
  },
  categories: { gap: 8, paddingVertical: 2 },
  categoryChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  categoryText: { fontSize: 12 },
  list: { gap: 10 },
  drugCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 7,
  },
  drugHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  drugName: { flex: 1, fontSize: 16 },
  drugMeta: { fontSize: 13, lineHeight: 18 },
});