import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Bars, BallTriangle } from "react-loader-spinner";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  FileText,
  UserCircle2,
  LogOut,
  Bell,
  Menu,
  X,
  Settings,
  ClipboardList,
  ChevronRight,
  Calendar,
  Users,
  Book,
  PlusCircle,
  User,
  CheckCircle,
  Building2,
  BookOpen,
  AlertCircle,
  Clock,
  Trash2,
  Search,
  XCircle,
  Filter,
  ArrowLeft,
  CheckSquare,
  Eye,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

const FeedbackDashboardContent = () => {
  return (
    <div>
      {/* <h2 className="text-2xl font-bold mb-4">Feedback Analysis Dashboard</h2> */}
      <p>Coming soon!</p>
    </div>
  );
};

export default FeedbackDashboardContent;
