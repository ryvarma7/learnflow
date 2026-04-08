"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Inter } from 'next/font/google';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Circle,
  Code2,
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  Flame,
  Link2,
  Video,
  FolderKanban,
} from 'lucide-react';

import { PageWrapper } from '@/components/ui/PageWrapper';
import { exportToPDF } from '@/lib/export';
import { decodeRoadmap } from '@/lib/share';
import { useStore } from '@/lib/store';
import { TopicNode } from '@/lib/types';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function makeHash(domain: string, subTrack: string): string {
  return btoa(domain + subTrack).slice(0, 8);
}

interface WeeklyPhase {
  id: string;
  name: string;
  milestone: string;
  topics: TopicNode[];
}

interface TopicSubtask {
  id: string;
  label: string;
}

type PlannerMode = 'weekly' | 'daily';
type GoalProfile = 'coding' | 'data' | 'design' | 'math' | 'security' | 'cloud' | 'generic';

function difficultyPillClass(difficulty: TopicNode['difficulty']): string {
  if (difficulty === 'beginner') return 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/35';
  if (difficulty === 'intermediate') return 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/35';
  return 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/35';
}

function initialsFromName(name: string): string {
  const tokens = name
    .split(' ')
    .map((token) => token.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (tokens.length === 0) return 'LF';
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();
  return `${tokens[0][0]}${tokens[1][0]}`.toUpperCase();
}

function getResourceIcon(resource: { type: string; url: string }) {
  const url = resource.url.toLowerCase();
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');

  if (isYouTube || resource.type === 'video') {
    return <Video size={12} className="shrink-0 text-[#EC4899]" />;
  }

  if (resource.type === 'docs') {
    return <BookOpen size={12} className="shrink-0 text-[#6366F1]" />;
  }

  if (resource.type === 'practice') {
    return <Code2 size={12} className="shrink-0 text-[#22C55E]" />;
  }

  return <Link2 size={12} className="shrink-0 text-[#6B7280]" />;
}

function stripTaskPrefix(name: string): string {
  return name.replace(/^(Watch|Read|Practice|Build):\s*/i, '').trim();
}

function getParentTopicIdFromDailyId(dailyId: string): string | null {
  const marker = '__daily__';
  if (dailyId.includes(marker)) {
    return dailyId.split(marker)[0] || null;
  }

  // Legacy IDs before the __daily__ marker was introduced.
  const legacyMatch = dailyId.match(/^(.*)-(subtask-\d+|res-\d+|build)$/);
  if (legacyMatch && legacyMatch[1]) {
    return legacyMatch[1];
  }

  return null;
}

function getCanonicalTopicId(topicId: string): string {
  return getParentTopicIdFromDailyId(topicId) ?? topicId;
}

function normalizeSubtopicId(subtopicId: string): string | null {
  const match = subtopicId.match(/^(.*)-sub-(\d+)$/);
  if (!match || !match[1] || !match[2]) return null;

  const canonicalTopicId = getCanonicalTopicId(match[1]);
  return `${canonicalTopicId}-sub-${match[2]}`;
}

function getSubtopicIdsForTopic(topicId: string): string[] {
  const canonicalTopicId = getCanonicalTopicId(topicId);
  return [1, 2, 3].map((index) => `${canonicalTopicId}-sub-${index}`);
}

function getTopicIdFromSubtopicId(subtopicId: string): string | null {
  const normalized = normalizeSubtopicId(subtopicId);
  if (!normalized) return null;
  return normalized.replace(/-sub-\d+$/, '');
}

function detectGoalProfile(domainText: string): GoalProfile {
  const text = domainText.toLowerCase();

  if (/(programming|web development|mobile development|software|frontend|backend|full stack|algorithms|data structures)/.test(text)) {
    return 'coding';
  }

  if (/(data science|machine learning|analytics|ai|artificial intelligence|nlp|computer vision|data visualization)/.test(text)) {
    return 'data';
  }

  if (/(design|ui|ux|graphics|ar\/vr|game development)/.test(text)) {
    return 'design';
  }

  if (/(mathematics|math|probability|linear algebra|theory)/.test(text)) {
    return 'math';
  }

  if (/(cybersecurity|security|cryptography|forensics|ethical hacking)/.test(text)) {
    return 'security';
  }

  if (/(cloud|devops|docker|kubernetes|aws|azure|google cloud)/.test(text)) {
    return 'cloud';
  }

  return 'generic';
}

function getProofOfWork(profile: GoalProfile): string {
  if (profile === 'coding') return 'a commit or working demo';
  if (profile === 'data') return 'a notebook cell output or chart';
  if (profile === 'design') return 'a screen draft or component mock';
  if (profile === 'math') return 'solved problems with final answers';
  if (profile === 'security') return 'a lab note with findings';
  if (profile === 'cloud') return 'a deployed service or pipeline run';
  return 'a short artifact you can show';
}

function getPracticeTaskLabel(profile: GoalProfile, sourceLabel: string): string {
  if (profile === 'coding') return `Practice: Solve 2 implementation drills from ${sourceLabel}`;
  if (profile === 'data') return `Practice: Reproduce one analysis from ${sourceLabel}`;
  if (profile === 'design') return `Practice: Recreate one UI pattern from ${sourceLabel}`;
  if (profile === 'math') return `Practice: Solve 10 focused problems from ${sourceLabel}`;
  if (profile === 'security') return `Practice: Run one security lab from ${sourceLabel}`;
  if (profile === 'cloud') return `Practice: Execute one deploy workflow from ${sourceLabel}`;
  return `Practice: Apply one concrete exercise from ${sourceLabel}`;
}

function createResourceTaskName(
  resource: TopicNode['resources'][number],
  profile: GoalProfile
): string {
  if (resource.type === 'video') {
    return `Watch: ${resource.label} and capture 3 takeaways`;
  }

  if (resource.type === 'docs') {
    return `Read: ${resource.label} and extract action notes`;
  }

  return getPracticeTaskLabel(profile, resource.label);
}

function mergeResourcesWithDocsFirst(
  primary: TopicNode['resources'][number][],
  allOriginal: TopicNode['resources'][number][]
): TopicNode['resources'] {
  const docs = allOriginal.filter((resource) => resource.type === 'docs');
  const combined = [...docs, ...primary, ...allOriginal];
  const seen = new Set<string>();

  return combined.filter((resource) => {
    const key = `${resource.type}|${resource.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function createBuildTaskName(topicName: string, profile: GoalProfile): string {
  if (profile === 'coding') return `Ship: ${topicName}`;
  if (profile === 'data') return `Analyze: ${topicName}`;
  if (profile === 'design') return `Design: ${topicName}`;
  if (profile === 'math') return `Prove and solve: ${topicName}`;
  if (profile === 'security') return `Secure and test: ${topicName}`;
  if (profile === 'cloud') return `Deploy: ${topicName}`;
  return `Build: ${topicName}`;
}

function createMilestone(kind: 'weekly' | 'daily', tasks: TopicNode[], proofOfWork: string): string {
  const labels = tasks.map((task) => stripTaskPrefix(task.name)).filter(Boolean);
  const first = labels[0] ?? 'the work';
  const second = labels[1];
  const last = labels[labels.length - 1] ?? first;

  if (kind === 'weekly') {
    if (labels.length <= 1) {
      return `Finish ${first} and be ready to use it`;
    }

    if (labels.length === 2) {
      return `Finish ${first} and connect it to ${second}`;
    }

    return `Finish ${first}, lock in ${second}, and ship a weekly deliverable`;
  }

  if (labels.length <= 1) {
    return `Finish ${first} and capture proof: ${proofOfWork}`;
  }

  return `Do ${first}, then ${last}, and close with proof: ${proofOfWork}`;
}

export default function RoadmapPage() {
  const {
    generatedRoadmap,
    completedTopics,
    selectedDomain,
    selectedSubTrack,
    preferences,
    setRoadmap,
    setPreferences,
    setDomain,
    setSubTrack,
    setCompletedTopics,
  } = useStore();
  const router = useRouter();

  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [openResources, setOpenResources] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeDayKeys, setActiveDayKeys] = useState<string[]>([]);
  const [userName, setUserName] = useState('Alex Lee');
  const [completedSubtopics, setCompletedSubtopics] = useState<string[]>([]);
  const [plannerMode, setPlannerMode] = useState<PlannerMode>('weekly');
  const [activeTopicByPhase, setActiveTopicByPhase] = useState<Record<string, string>>({});
  const [calendarOffsetDays, setCalendarOffsetDays] = useState(0);
  const prevCompletedRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 2400);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('r');
    if (encoded) {
      const decoded = decodeRoadmap(encoded);
      if (decoded) {
        setRoadmap(decoded.roadmap);
        setPreferences(decoded.prefs);
        setDomain(decoded.roadmap.domain);
        setSubTrack(decoded.roadmap.subTrack);
        window.history.replaceState({}, '', '/roadmap');
      }
    }
  }, [setDomain, setPreferences, setRoadmap, setSubTrack]);

  useEffect(() => {
    if (!generatedRoadmap) {
      router.push('/');
    }
  }, [generatedRoadmap, router]);

  useEffect(() => {
    if (!selectedDomain || !selectedSubTrack) return;

    try {
      const hash = makeHash(selectedDomain, selectedSubTrack);
      const savedProgress = localStorage.getItem(`pf_progress_${hash}`);
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress) as string[];
        if (Array.isArray(parsed)) {
          setCompletedTopics(parsed);
        }
      }

      const savedActivity = localStorage.getItem(`pf_activity_${hash}`);
      if (savedActivity) {
        const parsed = JSON.parse(savedActivity) as string[];
        if (Array.isArray(parsed)) {
          setActiveDayKeys(parsed);
        }
      } else {
        // Seed a minimal demo streak for first-time users.
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const seedActivity = [dayKey(yesterday), dayKey(today)];
        setActiveDayKeys(seedActivity);
        localStorage.setItem(`pf_activity_${hash}`, JSON.stringify(seedActivity));
      }

      const savedSubtopics = localStorage.getItem(`pf_subtopics_${hash}`);
      if (savedSubtopics) {
        const parsed = JSON.parse(savedSubtopics) as string[];
        if (Array.isArray(parsed)) {
          const normalized = Array.from(
            new Set(parsed.map((id) => normalizeSubtopicId(id)).filter((id): id is string => !!id))
          );
          setCompletedSubtopics(normalized);
        }
      }
    } catch {
      // Ignore malformed local storage payloads.
    }
  }, [selectedDomain, selectedSubTrack, setCompletedTopics]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedName = localStorage.getItem('pf_user_name');
    if (savedName && savedName.trim()) {
      setUserName(savedName);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('pf_user_name', userName);
  }, [userName]);

  useEffect(() => {
    if (!selectedDomain || !selectedSubTrack) return;

    try {
      const hash = makeHash(selectedDomain, selectedSubTrack);
      localStorage.setItem(`pf_subtopics_${hash}`, JSON.stringify(completedSubtopics));
    } catch {
      // Best effort persistence only.
    }
  }, [completedSubtopics, selectedDomain, selectedSubTrack]);

  const handleCopyText = () => {
    if (!generatedRoadmap) return;

    let text = `LearnFlow Roadmap: ${generatedRoadmap.domain} - ${generatedRoadmap.subTrack}\n\n`;
    generatedRoadmap.phases.forEach((phase, index) => {
      text += `Phase ${index + 1}: ${phase.name}\n`;
      text += `Milestone: ${phase.milestone}\n`;
      phase.topics.forEach((topic) => {
        text += `  - ${topic.name} (${topic.estimatedHours}h, ${topic.difficulty})\n`;
      });
      text += '\n';
    });

    navigator.clipboard.writeText(text);
    showToast('Outline copied to clipboard.');
  };

  const handleExport = async () => {
    if (!generatedRoadmap) return;
    setIsExporting(true);
    try {
      await exportToPDF(generatedRoadmap, {
        userName,
        completedTopicIds: completedBaseTopicIds,
        sections: plannedPhases.map((phase) => ({
          id: phase.id,
          name: phase.name,
          milestone: phase.milestone,
          topics: phase.topics.map((topic) => ({
            id: topic.id,
            name: topic.name,
            estimatedHours: topic.estimatedHours,
            difficulty: topic.difficulty,
            subtopics: getSubtopicsForTopic(topic).map((subtopic) => subtopic.label),
          })),
        })),
      });
      showToast('PDF exported successfully.');
    } catch {
      showToast('Failed to export PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  const toggleResourcePanel = (topicId: string) => {
    setOpenResources((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const toggleSubtopic = (subtopicId: string) => {
    const normalizedSubtopicId = normalizeSubtopicId(subtopicId);
    const baseTopicId = getTopicIdFromSubtopicId(subtopicId);
    if (!normalizedSubtopicId || !baseTopicId) return;

    setCompletedSubtopics((prev) => {
      const next = prev.includes(normalizedSubtopicId)
        ? prev.filter((id) => id !== normalizedSubtopicId)
        : [...prev, normalizedSubtopicId];

      const requiredSubtopics = getSubtopicIdsForTopic(baseTopicId);
      const isBaseTopicComplete = requiredSubtopics.every((id) => next.includes(id));
      const childDailyIds = dailyChildrenByBase.get(baseTopicId) ?? [];

      const nextTopicSet = new Set(completedTopics);
      if (isBaseTopicComplete) {
        nextTopicSet.add(baseTopicId);
        childDailyIds.forEach((id) => nextTopicSet.add(id));
      } else {
        nextTopicSet.delete(baseTopicId);
        childDailyIds.forEach((id) => nextTopicSet.delete(id));
      }
      setCompletedTopics(Array.from(nextTopicSet));

      return next;
    });
  };

  const getSubtopicsForTopic = (topic: TopicNode): TopicSubtask[] => {
    const canonicalTopicId = getCanonicalTopicId(topic.id);
    const sourceTopic =
      generatedRoadmap?.phases.flatMap((phase) => phase.topics).find((item) => item.id === canonicalTopicId) ?? topic;

    const labelSource = sourceTopic.resources?.slice(0, 2).map((resource) => resource.label) ?? [];
    const fallback = ['Understand fundamentals', 'Practice key exercises'];
    const labels = [...labelSource, ...fallback].slice(0, 2);

    return [
      { id: `${canonicalTopicId}-sub-1`, label: labels[0] ?? 'Understand fundamentals' },
      { id: `${canonicalTopicId}-sub-2`, label: labels[1] ?? 'Practice key exercises' },
      { id: `${canonicalTopicId}-sub-3`, label: sourceTopic.projectIdea || 'Build a mini project' },
    ];
  };

  const totals = useMemo(() => {
    if (!generatedRoadmap) {
      return { topicCount: 0, hours: 0, phaseCount: 0 };
    }

    const topicCount = generatedRoadmap.phases.reduce((sum, phase) => sum + phase.topics.length, 0);
    const hours = generatedRoadmap.phases.reduce(
      (sum, phase) => sum + phase.topics.reduce((phaseSum, topic) => phaseSum + topic.estimatedHours, 0),
      0
    );
    const phaseCount = generatedRoadmap.phases.length;
    return { topicCount, hours, phaseCount };
  }, [generatedRoadmap]);

  const allTopics = useMemo(() => {
    if (!generatedRoadmap) return [];
    return generatedRoadmap.phases.flatMap((phase) => phase.topics);
  }, [generatedRoadmap]);

  const goalContext = useMemo(
    () => `${selectedDomain ?? generatedRoadmap?.domain ?? ''} ${selectedSubTrack ?? generatedRoadmap?.subTrack ?? ''}`,
    [generatedRoadmap?.domain, generatedRoadmap?.subTrack, selectedDomain, selectedSubTrack]
  );

  const goalProfile = useMemo(() => detectGoalProfile(goalContext), [goalContext]);
  const proofOfWork = useMemo(() => getProofOfWork(goalProfile), [goalProfile]);

  const weeklyPhases = useMemo<WeeklyPhase[]>(() => {
    if (!generatedRoadmap) return [];
    const weeklyBudget = Math.max(6, (preferences?.hoursPerDay ?? 2) * 7);

    const groups: WeeklyPhase[] = [];
    let currentWeekTopics: TopicNode[] = [];
    let currentHours = 0;

    allTopics.forEach((topic) => {
      const nextHours = currentHours + topic.estimatedHours;
      if (currentWeekTopics.length > 0 && nextHours > weeklyBudget) {
        const weekIndex = groups.length + 1;
        groups.push({
          id: `week-${weekIndex}`,
          name: `Week ${weekIndex}`,
          milestone: createMilestone('weekly', currentWeekTopics, proofOfWork),
          topics: currentWeekTopics,
        });
        currentWeekTopics = [topic];
        currentHours = topic.estimatedHours;
      } else {
        currentWeekTopics.push(topic);
        currentHours = nextHours;
      }
    });

    if (currentWeekTopics.length > 0) {
      const weekIndex = groups.length + 1;
      groups.push({
        id: `week-${weekIndex}`,
        name: `Week ${weekIndex}`,
        milestone: createMilestone('weekly', currentWeekTopics, proofOfWork),
        topics: currentWeekTopics,
      });
    }

    return groups;
  }, [allTopics, generatedRoadmap, preferences?.hoursPerDay, proofOfWork]);

  const dailyPhases = useMemo<WeeklyPhase[]>(() => {
    if (!generatedRoadmap) return [];

    const dailyBudget = Math.max(1, preferences?.hoursPerDay ?? 2);

    const granularDailyTasks: TopicNode[] = allTopics.flatMap((topic) => {
      const subtopics = getSubtopicsForTopic(topic);
      const resourceTasks = topic.resources.map((resource, idx) => ({
        id: `${topic.id}__daily__res-${idx + 1}`,
        name: createResourceTaskName(resource, goalProfile),
        estimatedHours: resource.type === 'video' ? 1 : 1,
        difficulty: topic.difficulty,
        description: `Use this resource to move ${topic.name} forward`,
        resources: mergeResourcesWithDocsFirst([resource], topic.resources),
        projectIdea: topic.projectIdea,
      }));

      const subtopicTasks = subtopics.map((subtopic, idx) => ({
        id: `${topic.id}__daily__subtask-${idx + 1}`,
        name: subtopic.label,
        estimatedHours: Math.max(1, Math.ceil(topic.estimatedHours / Math.max(subtopics.length, 1))),
        difficulty: topic.difficulty,
        description: `Daily subtopic from ${topic.name}`,
        resources: mergeResourcesWithDocsFirst(topic.resources, topic.resources),
        projectIdea: topic.projectIdea,
      }));

      const buildTask: TopicNode = {
        id: `${topic.id}__daily__build`,
        name: createBuildTaskName(topic.name, goalProfile),
        estimatedHours: Math.max(1, Math.ceil(topic.estimatedHours / 3)),
        difficulty: topic.difficulty,
        description: `Finish a concrete deliverable for ${topic.name}`,
        resources: mergeResourcesWithDocsFirst(topic.resources, topic.resources),
        projectIdea: topic.projectIdea,
      };

      return [...subtopicTasks, ...resourceTasks, buildTask];
    });

    const groups: WeeklyPhase[] = [];
    let currentDayTopics: TopicNode[] = [];
    let currentHours = 0;

    granularDailyTasks.forEach((topic) => {
      const nextHours = currentHours + topic.estimatedHours;
      if (currentDayTopics.length > 0 && nextHours > dailyBudget) {
        const dayIndex = groups.length + 1;
        groups.push({
          id: `day-${dayIndex}`,
          name: `Day ${dayIndex}`,
          milestone: createMilestone('daily', currentDayTopics, proofOfWork),
          topics: currentDayTopics,
        });
        currentDayTopics = [topic];
        currentHours = topic.estimatedHours;
      } else {
        currentDayTopics.push(topic);
        currentHours = nextHours;
      }
    });

    if (currentDayTopics.length > 0) {
      const dayIndex = groups.length + 1;
      groups.push({
        id: `day-${dayIndex}`,
        name: `Day ${dayIndex}`,
        milestone: createMilestone('daily', currentDayTopics, proofOfWork),
        topics: currentDayTopics,
      });
    }

    return groups;
  }, [allTopics, generatedRoadmap, goalProfile, preferences?.hoursPerDay, proofOfWork]);

  const plannedPhases = useMemo(
    () => (plannerMode === 'daily' ? dailyPhases : weeklyPhases),
    [dailyPhases, plannerMode, weeklyPhases]
  );

  const baseTopicIdSet = useMemo(() => new Set(allTopics.map((topic) => topic.id)), [allTopics]);

  const dailyChildrenByBase = useMemo(() => {
    const map = new Map<string, string[]>();

    dailyPhases.forEach((phase) => {
      phase.topics.forEach((topic) => {
        const parentId = getParentTopicIdFromDailyId(topic.id);
        if (!parentId || !baseTopicIdSet.has(parentId)) return;

        const existing = map.get(parentId) ?? [];
        map.set(parentId, [...existing, topic.id]);
      });
    });

    return map;
  }, [baseTopicIdSet, dailyPhases]);

  const completedTopicSet = useMemo(() => new Set(completedTopics), [completedTopics]);

  const isTopicCompleted = useCallback(
    (topicId: string) => {
      const parentId = getParentTopicIdFromDailyId(topicId);

      // Daily task is complete if itself is done OR parent topic is done.
      if (parentId && baseTopicIdSet.has(parentId)) {
        return completedTopicSet.has(topicId) || completedTopicSet.has(parentId);
      }

      // Base weekly topic is complete if itself is done OR all child daily tasks are done.
      const childDailyIds = dailyChildrenByBase.get(topicId);
      if (childDailyIds && childDailyIds.length > 0) {
        return completedTopicSet.has(topicId) || childDailyIds.every((id) => completedTopicSet.has(id));
      }

      return completedTopicSet.has(topicId);
    },
    [baseTopicIdSet, completedTopicSet, dailyChildrenByBase]
  );

  const completedBaseTopicIds = useMemo(
    () => allTopics.map((topic) => topic.id).filter((topicId) => isTopicCompleted(topicId)),
    [allTopics, isTopicCompleted]
  );

  const completedBaseTopicCount = completedBaseTopicIds.length;

  useEffect(() => {
    if (!selectedDomain || !selectedSubTrack) return;

    if (prevCompletedRef.current === null) {
      prevCompletedRef.current = completedBaseTopicCount;
      return;
    }

    if (completedBaseTopicCount === prevCompletedRef.current) return;

    const today = dayKey(new Date());
    setActiveDayKeys((prev) => {
      const merged = Array.from(new Set([...prev, today])).sort();
      try {
        const hash = makeHash(selectedDomain, selectedSubTrack);
        localStorage.setItem(`pf_activity_${hash}`, JSON.stringify(merged));
      } catch {
        // Best effort persistence only.
      }
      return merged;
    });

    prevCompletedRef.current = completedBaseTopicCount;
  }, [completedBaseTopicCount, selectedDomain, selectedSubTrack]);

  const toggleTopicWithSync = useCallback(
    (topicId: string) => {
      const nextSet = new Set(completedTopics);
      const currentlyCompleted = isTopicCompleted(topicId);
      const parentId = getParentTopicIdFromDailyId(topicId);
      const baseTopicId = parentId && baseTopicIdSet.has(parentId) ? parentId : topicId;

      if (parentId && baseTopicIdSet.has(parentId)) {
        const siblings = dailyChildrenByBase.get(parentId) ?? [];

        if (currentlyCompleted) {
          // Unchecking a daily task should also uncheck the parent.
          nextSet.delete(topicId);
          nextSet.delete(parentId);
        } else {
          nextSet.add(topicId);
          const allDone = siblings.every((id) => id === topicId || nextSet.has(id));
          if (allDone) {
            nextSet.add(parentId);
          }
        }
      } else {
        const children = dailyChildrenByBase.get(topicId) ?? [];

        if (currentlyCompleted) {
          nextSet.delete(topicId);
          children.forEach((id) => nextSet.delete(id));
        } else {
          nextSet.add(topicId);
          children.forEach((id) => nextSet.add(id));
        }
      }

      const baseChildren = dailyChildrenByBase.get(baseTopicId) ?? [];
      const isBaseNowCompleted =
        nextSet.has(baseTopicId) ||
        (baseChildren.length > 0 && baseChildren.every((id) => nextSet.has(id)));

      setCompletedSubtopics((prev) => {
        const nextSubtopics = new Set(prev);
        const subtopicIds = getSubtopicIdsForTopic(baseTopicId);

        if (isBaseNowCompleted) {
          subtopicIds.forEach((id) => nextSubtopics.add(id));
        } else {
          subtopicIds.forEach((id) => nextSubtopics.delete(id));
        }

        return Array.from(nextSubtopics);
      });

      setCompletedTopics(Array.from(nextSet));
    },
    [baseTopicIdSet, completedTopics, dailyChildrenByBase, isTopicCompleted, setCompletedTopics]
  );

  useEffect(() => {
    if (plannedPhases.length === 0) return;

    setExpandedPhases((prev) => {
      const valid = new Set(plannedPhases.map((phase) => phase.id));
      const kept = Array.from(prev).filter((id) => valid.has(id));
      if (kept.length === 0) {
        kept.push(plannedPhases[0].id);
      }
      return new Set(kept);
    });
  }, [plannedPhases]);

  const completedSectionCount = useMemo(
    () =>
      plannedPhases.filter(
        (phase) => phase.topics.length > 0 && phase.topics.every((topic) => isTopicCompleted(topic.id))
      ).length,
    [isTopicCompleted, plannedPhases]
  );

  const currentSectionIndex = useMemo(() => {
    if (plannedPhases.length === 0) return -1;
    return plannedPhases.findIndex(
      (phase) => !phase.topics.every((topic) => isTopicCompleted(topic.id))
    );
  }, [isTopicCompleted, plannedPhases]);

  const streakSummary = useMemo(() => {
    const activity = new Set(activeDayKeys);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const todayKey = dayKey(todayDate);

    const days = Array.from({ length: 30 }, (_, index) => {
      const date = new Date(todayDate);
      date.setDate(date.getDate() - calendarOffsetDays - (29 - index));
      const key = dayKey(date);
      return {
        key,
        date,
        isToday: key === todayKey,
        isActive: activity.has(key),
      };
    });

    let current = 0;
    for (let i = days.length - 1; i >= 0; i -= 1) {
      if (!days[i].isActive) break;
      current += 1;
    }

    let best = 0;
    let run = 0;
    days.forEach((day) => {
      if (day.isActive) {
        run += 1;
        best = Math.max(best, run);
      } else {
        run = 0;
      }
    });

    const firstDay = days[0]?.date;
    const lastDay = days[days.length - 1]?.date;

    return { days, current, best, firstDay, lastDay };
  }, [activeDayKeys, calendarOffsetDays]);

  if (!generatedRoadmap) return null;

  const progressPercent = totals.topicCount > 0 ? (completedBaseTopicCount / totals.topicCount) * 100 : 0;

  const ringRadius = 46;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (progressPercent / 100) * ringCircumference;

  return (
    <PageWrapper>
      <div
        className={`${inter.className} min-h-screen bg-[#0A0A0A] text-[#FFFFFF]`}
        style={{
          backgroundImage:
            'radial-gradient(900px 500px at 95% -10%, rgba(99,102,241,0.09), transparent), radial-gradient(700px 500px at -10% 110%, rgba(236,72,153,0.05), transparent)',
        }}
      >
        <div className="mx-auto w-full max-w-[1440px] px-4 py-4 md:px-6 md:py-5">
          <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#6B7280]">{generatedRoadmap.domain}</span>
              <span className="text-[#6B7280]">→</span>
              <span className="text-[#F8F8FF]">{generatedRoadmap.subTrack}</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="mr-2 inline-flex rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-1">
                <button
                  type="button"
                  onClick={() => setPlannerMode('daily')}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    plannerMode === 'daily' ? 'bg-[#6366F1] text-white' : 'text-[#6B7280] hover:text-white'
                  }`}
                >
                  Daily Goals
                </button>
                <button
                  type="button"
                  onClick={() => setPlannerMode('weekly')}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    plannerMode === 'weekly' ? 'bg-[#6366F1] text-white' : 'text-[#6B7280] hover:text-white'
                  }`}
                >
                  Weekly Goals
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center gap-2 rounded-lg border border-[#1F1F1F] bg-transparent px-3 py-2 text-sm text-[#FFFFFF] transition-colors hover:bg-[#111111]"
              >
                <Copy size={14} />
                Copy Text
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={handleExport}
                className="inline-flex items-center gap-2 rounded-lg border border-[#1F1F1F] bg-transparent px-3 py-2 text-sm text-[#FFFFFF] transition-colors hover:bg-[#111111] disabled:opacity-60"
              >
                <Download size={14} />
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </button>
              <div className="ml-1 text-sm text-[#6B7280]">
                <span className="text-[#FFFFFF]">{completedBaseTopicCount}</span> / {totals.topicCount}
              </div>
            </div>
          </header>

          <div className="grid gap-5 lg:grid-cols-[30%_70%]">
            <aside className="lg:sticky lg:top-5 lg:self-start">
              <div className="rounded-2xl border border-[#1F1F1F] bg-[#111111] p-5">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1F1F1F] text-sm font-semibold text-[#FFFFFF]">
                    {initialsFromName(userName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#6B7280]">Learner</p>
                    <input
                      value={userName}
                      onChange={(event) => setUserName(event.target.value)}
                      className="mt-1 w-full rounded-md border border-[#1F1F1F] bg-[#0A0A0A] px-2.5 py-1.5 text-base font-medium text-[#FFFFFF] outline-none transition-colors placeholder:text-[#6B7280] focus:border-[#6366F1]"
                      placeholder="Your name"
                      aria-label="User name"
                    />
                  </div>
                </div>

                <div className="mb-6 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-4">
                  <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[#6B7280]">Overall Progress</p>
                  <div className="flex items-center gap-4">
                    <div className="relative h-[108px] w-[108px]">
                      <svg viewBox="0 0 112 112" className="h-full w-full -rotate-90">
                        <circle cx="56" cy="56" r={ringRadius} stroke="#1F1F1F" strokeWidth="10" fill="none" />
                        <circle
                          cx="56"
                          cy="56"
                          r={ringRadius}
                          stroke="#6366F1"
                          strokeWidth="10"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={ringCircumference}
                          strokeDashoffset={ringOffset}
                          style={{ transition: 'stroke-dashoffset 280ms ease' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold">
                        {Math.round(progressPercent)}%
                      </div>
                    </div>
                    <div className="text-sm text-[#6B7280]">
                      <p className="text-[#FFFFFF]">{completedBaseTopicCount} topics done</p>
                      <p>{totals.topicCount - completedBaseTopicCount} topics remaining</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6 rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 text-[#FFFFFF]">
                      <Flame size={17} color="#EC4899" />
                      <span className="text-2xl font-semibold">{streakSummary.current}</span>
                    </div>
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCalendarOffsetDays((prev) => prev + 30)}
                        className="rounded-md border border-[#1F1F1F] bg-[#111111] p-1 text-[#6B7280] transition-colors hover:text-[#FFFFFF]"
                        aria-label="View previous 30 days"
                        title="View previous 30 days"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalendarOffsetDays((prev) => prev - 30)}
                        className="rounded-md border border-[#1F1F1F] bg-[#111111] p-1 text-[#6B7280] transition-colors hover:text-[#FFFFFF]"
                        aria-label="View next 30 days"
                        title="View next 30 days"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  <p className="mb-3 text-sm font-medium text-[#FFFFFF]">🔥 {streakSummary.current} day streak</p>

                  <div className="mb-2 flex items-center justify-between text-[11px] text-[#6B7280]">
                    <span>
                      {streakSummary.firstDay?.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span>
                      {streakSummary.lastDay?.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="grid grid-cols-6 gap-2">
                    {streakSummary.days.map((day) => {
                      const color = day.isToday ? '#EC4899' : day.isActive ? '#7C3AED' : '#1E1E2E';
                      return (
                        <div
                          key={day.key}
                          className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-transparent text-[9px] font-medium text-[#FFFFFF]"
                          style={{ backgroundColor: color }}
                          title={day.date.toDateString()}
                        >
                          {day.date.getDate()}
                        </div>
                      );
                    })}
                  </div>

                  <p className="mt-3 text-xs text-[#6B7280]">Best streak: {streakSummary.best} days</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-[#1E1E2E] bg-[#0A0A0F] p-3">
                    <p className="text-lg font-semibold">{totals.topicCount}</p>
                    <p className="text-xs text-[#6B7280]">Topics</p>
                  </div>
                  <div className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-3">
                    <p className="text-lg font-semibold">{totals.hours}h</p>
                    <p className="text-xs text-[#6B7280]">Total hours</p>
                  </div>
                  <div className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-3">
                    <p className="text-lg font-semibold">
                      {completedSectionCount}/{plannedPhases.length}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {plannerMode === 'daily' ? 'Days done' : 'Weeks done'}
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            <section className="relative min-w-0 pb-4">
              <div className="space-y-4">
                {plannedPhases.map((phase, index) => {
                  const phaseCompleted = phase.topics.filter((t) => isTopicCompleted(t.id)).length;
                  const phaseProgress = phase.topics.length
                    ? (phaseCompleted / phase.topics.length) * 100
                    : 0;
                  const isExpanded = expandedPhases.has(phase.id);
                  const isCompleted = phaseProgress === 100;
                  const isCurrent = currentSectionIndex === index;
                  const activeTopicId = activeTopicByPhase[phase.id] ?? phase.topics[0]?.id;
                  const activeTopic = phase.topics.find((topic) => topic.id === activeTopicId) ?? phase.topics[0];
                  const activeSubtopics = activeTopic ? getSubtopicsForTopic(activeTopic) : [];
                  const showConnector = index < plannedPhases.length - 1;

                  return (
                    <article key={phase.id} className="relative pl-20">
                      {showConnector && (
                        <div className="pointer-events-none absolute left-8 top-[44px] -bottom-4 w-px">
                          <div className="absolute inset-0 bg-[#1F1F1F]" />
                          <motion.div
                            className="absolute left-0 top-0 w-px bg-gradient-to-b from-[#6366F1] via-[#7C3AED] to-[#EC4899]"
                            initial={false}
                            animate={{ height: isCompleted ? '100%' : '0%' }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        className="absolute left-0 top-3 flex h-16 w-16 items-center justify-center"
                        onClick={() => togglePhase(phase.id)}
                      >
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold text-[#FFFFFF] transition-all ${
                            isCompleted
                              ? 'border-[#6366F1] bg-[#6366F1]'
                              : isCurrent
                                ? 'border-[#6366F1] bg-[#111111] shadow-[0_0_0_2px_rgba(99,102,241,0.25),0_0_24px_rgba(99,102,241,0.45)] animate-pulse'
                                : 'border-[#1F1F1F] bg-[#111111]'
                          }`}
                        >
                          {index + 1}
                        </span>
                      </button>

                      <div className="rounded-2xl border border-[#1F1F1F] bg-[#111111]">
                        <button
                          type="button"
                          onClick={() => togglePhase(phase.id)}
                          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-base font-medium">{phase.name}</p>
                            <p className="truncate text-sm text-[#6B7280]">{phase.milestone}</p>
                            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#1F1F1F]">
                              <div
                                className="h-full bg-[#6366F1]"
                                style={{ width: `${phaseProgress}%`, transition: 'width 280ms ease' }}
                              />
                            </div>
                          </div>
                          <ChevronDown
                            size={18}
                            className="shrink-0 text-[#6B7280]"
                            style={{
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 220ms ease',
                            }}
                          />
                        </button>

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.24, ease: 'easeOut' }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-[#1F1F1F] px-4 py-4">
                                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)]">
                                  <div className="grid gap-3">
                                    {phase.topics.map((topic) => {
                                      const isCompleted = isTopicCompleted(topic.id);
                                      const resourceOpen = !!openResources[topic.id];
                                      const isActiveTopic = activeTopic?.id === topic.id;

                                      return (
                                        <div
                                          key={topic.id}
                                          className={`rounded-xl border bg-[#111111] p-4 transition-colors ${
                                            isActiveTopic ? 'border-[#6366F1]' : 'border-[#1F1F1F]'
                                          }`}
                                          onClick={() =>
                                            setActiveTopicByPhase((prev) => ({
                                              ...prev,
                                              [phase.id]: topic.id,
                                            }))
                                          }
                                        >
                                          <div className="mb-3 flex items-start justify-between gap-3">
                                            <h4 className="line-clamp-2 text-sm font-medium">{topic.name}</h4>
                                            <button
                                              type="button"
                                              aria-label={isCompleted ? 'Mark topic incomplete' : 'Mark topic complete'}
                                              onClick={(event) => {
                                                event.stopPropagation();
                                                toggleTopicWithSync(topic.id);
                                              }}
                                              className="shrink-0 text-[#FFFFFF]"
                                            >
                                              {isCompleted ? (
                                                <CheckCircle2 size={20} fill="#6366F1" stroke="#6366F1" />
                                              ) : (
                                                <Circle size={20} stroke="#6B7280" />
                                              )}
                                            </button>
                                          </div>

                                          <div className="mb-3 flex items-center justify-between gap-2">
                                            <span
                                              className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${difficultyPillClass(topic.difficulty)}`}
                                            >
                                              {topic.difficulty}
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-xs text-[#6B7280]">
                                              <Clock3 size={13} /> {topic.estimatedHours}h
                                            </span>
                                          </div>

                                          <p className="mb-3 line-clamp-2 text-xs text-[#6B7280]">{topic.description}</p>

                                          <div className="mb-3 rounded-lg border border-[#1E1E2E] bg-[#0A0A0F]">
                                            <button
                                              type="button"
                                              onClick={(event) => {
                                                event.stopPropagation();
                                                toggleResourcePanel(topic.id);
                                              }}
                                              className="flex w-full items-center justify-between px-3 py-2 text-left text-xs text-[#FFFFFF]"
                                            >
                                              <span className="inline-flex items-center gap-2">
                                                <Link2 size={13} /> Resources
                                              </span>
                                              <ChevronDown
                                                size={14}
                                                style={{
                                                  transform: resourceOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                  transition: 'transform 200ms ease',
                                                }}
                                              />
                                            </button>

                                            <AnimatePresence initial={false}>
                                              {resourceOpen && (
                                                <motion.div
                                                  initial={{ height: 0, opacity: 0 }}
                                                  animate={{ height: 'auto', opacity: 1 }}
                                                  exit={{ height: 0, opacity: 0 }}
                                                  transition={{ duration: 0.2 }}
                                                  className="overflow-hidden"
                                                >
                                                  <div className="flex flex-wrap gap-1.5 px-3 pb-3">
                                                    {mergeResourcesWithDocsFirst(topic.resources, topic.resources)
                                                      .slice(0, 4)
                                                      .map((resource, resourceIndex) => (
                                                      <a
                                                        key={`${topic.id}-${resourceIndex}`}
                                                        href={resource.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        onClick={(event) => event.stopPropagation()}
                                                        className="max-w-[118px] truncate rounded-md border border-[#1F1F1F] bg-[#111111] px-2 py-1 text-[10px] text-[#6B7280] transition-colors hover:text-[#FFFFFF]"
                                                        title={resource.label}
                                                      >
                                                        <span className="inline-flex items-center gap-1.5">
                                                          {getResourceIcon(resource)}
                                                          <span className="truncate">{resource.label}</span>
                                                        </span>
                                                      </a>
                                                    ))}
                                                  </div>
                                                </motion.div>
                                              )}
                                            </AnimatePresence>
                                          </div>

                                          <p className="mt-auto inline-flex items-center gap-1 text-xs italic text-[#EC4899]">
                                            <FolderKanban size={13} />
                                            Build Something: {topic.projectIdea}
                                          </p>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  <aside className="rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-4">
                                    {activeTopic ? (
                                      <>
                                        <h4 className="text-sm font-semibold text-[#FFFFFF]">Subtopics</h4>
                                        <p className="mt-1 text-xs text-[#6B7280]">{activeTopic.name}</p>

                                        <div className="mt-3 space-y-2">
                                          {activeSubtopics.map((subtopic) => {
                                            const isSubtopicDone = completedSubtopics.includes(subtopic.id);
                                            return (
                                              <button
                                                key={subtopic.id}
                                                type="button"
                                                onClick={() => toggleSubtopic(subtopic.id)}
                                                className="flex w-full items-start gap-2 rounded-md border border-[#1F1F1F] bg-[#111111] px-2.5 py-2 text-left text-xs text-[#FFFFFF] transition-colors hover:bg-[#1F1F1F]"
                                              >
                                                {isSubtopicDone ? (
                                                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#6366F1]" />
                                                ) : (
                                                  <Circle size={15} className="mt-0.5 shrink-0 text-[#6B7280]" />
                                                )}
                                                <span className={isSubtopicDone ? 'text-[#A5B4FC]' : 'text-[#FFFFFF]'}>
                                                  {subtopic.label}
                                                </span>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </>
                                    ) : (
                                      <p className="text-xs text-[#6B7280]">Select a topic to view subtopics.</p>
                                    )}
                                  </aside>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed bottom-5 right-5 rounded-lg border border-[#1E1E2E] bg-[#13131A] px-4 py-2 text-sm text-[#F8F8FF]"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
