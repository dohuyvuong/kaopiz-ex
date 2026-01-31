'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { automationApi, type AutomationSetting } from '@/lib/api/automation';
import { Bot, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/types/api-error.types';

interface JobTypeCardProps {
  jobType: 'auto-review-checklist' | 'auto-create-forms';
  setting: AutomationSetting;
  onUpdate: (setting: AutomationSetting) => void;
}

function JobTypeCard({ jobType, setting, onUpdate }: JobTypeCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [enabled, setEnabled] = useState(setting.enabled);
  const [params, setParams] = useState(setting.params || {});
  const [notificationChannel, setNotificationChannel] = useState(
    setting.notificationChannel || 'telegram'
  );
  const [notificationTarget, setNotificationTarget] = useState(
    setting.notificationTarget || ''
  );
  const [autoApproveAfterMinutes, setAutoApproveAfterMinutes] = useState(
    setting.autoApproveAfterMinutes || 30
  );

  const jobTypeInfo = {
    'auto-review-checklist': {
      title: 'Duyệt Checklist Tự Động',
      description: 'Tự động kiểm tra và duyệt checklist định kỳ',
      icon: '✓',
    },
    'auto-create-forms': {
      title: 'Tạo Đơn Tự Động',
      description: 'Tự động tạo đơn xin nghỉ/vắng mặt khi phát hiện thiếu công',
      icon: '📝',
    },
  }[jobType];

  const handleSave = async () => {
    // Validate required fields when enabled
    if (enabled) {
      if (!notificationChannel) {
        toast.error('Vui lòng chọn kênh thông báo');
        return;
      }
      if (!notificationTarget || notificationTarget.trim() === '') {
        toast.error('Vui lòng nhập thông tin liên hệ để nhận thông báo');
        return;
      }
      if (!autoApproveAfterMinutes || autoApproveAfterMinutes < 1) {
        toast.error('Vui lòng nhập thời gian tự động duyệt (tối thiểu 1 phút)');
        return;
      }
    }

    setIsLoading(true);
    try {
      const updated = await automationApi.updateSetting(jobType, {
        enabled,
        params,
        notificationChannel: enabled ? notificationChannel : undefined,
        notificationTarget: enabled ? notificationTarget : undefined,
        autoApproveAfterMinutes: enabled ? autoApproveAfterMinutes : undefined,
      });
      onUpdate(updated);
      toast.success('Đã lưu cài đặt');
    } catch (error: unknown) {
      console.error('Error updating automation setting:', error);
      toast.error(getErrorMessage(error, 'Lỗi khi lưu cài đặt'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{jobTypeInfo.icon}</span>
              {jobTypeInfo.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {jobTypeInfo.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={enabled} onCheckedChange={setEnabled} />
            {enabled && <Badge variant="default">Đang bật</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {enabled && (
          <>
            {/* Params based on job type */}
            {jobType === 'auto-review-checklist' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="maxReviews">Số review tối đa mỗi lần</Label>
                  <Input
                    id="maxReviews"
                    type="number"
                    min="1"
                    value={params.maxReviews as number || 10}
                    onChange={(e) =>
                      setParams({ ...params, maxReviews: parseInt(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectName">
                    Tên dự án (để lọc, để trống = tất cả)
                  </Label>
                  <Input
                    id="projectName"
                    value={params.projectName as string || ''}
                    onChange={(e) =>
                      setParams({ ...params, projectName: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {jobType === 'auto-create-forms' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="lookbackDays">Số ngày quét lại</Label>
                  <Input
                    id="lookbackDays"
                    type="number"
                    min="1"
                    max="30"
                    value={params.lookbackDays as number || 7}
                    onChange={(e) =>
                      setParams({ ...params, lookbackDays: parseInt(e.target.value) })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Quét lại các ngày thiếu công trong N ngày gần đây
                  </p>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-medium text-sm">Thông báo</h4>
              <div className="space-y-2">
                <Label htmlFor="notificationChannel">
                  Kênh thông báo <span className="text-red-500">*</span>
                </Label>
                <select
                  id="notificationChannel"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={notificationChannel}
                  onChange={(e) => setNotificationChannel(e.target.value)}
                  required
                >
                  <option value="telegram">Telegram</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notificationTarget">
                  {notificationChannel === 'telegram'
                    ? 'Telegram Chat ID'
                    : 'Địa chỉ Email'}{' '}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="notificationTarget"
                  placeholder={
                    notificationChannel === 'telegram'
                      ? 'VD: 123456789'
                      : 'VD: email@example.com'
                  }
                  value={notificationTarget}
                  onChange={(e) => setNotificationTarget(e.target.value)}
                  required
                />
                {notificationChannel === 'telegram' && (
                  <p className="text-xs text-muted-foreground">
                    Bạn có thể lấy Chat ID bằng cách nhắn tin với bot @userinfobot
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="autoApproveAfterMinutes">
                  Tự động duyệt sau (phút) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="autoApproveAfterMinutes"
                  type="number"
                  min="1"
                  value={autoApproveAfterMinutes}
                  onChange={(e) =>
                    setAutoApproveAfterMinutes(parseInt(e.target.value))
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Nếu bạn không xác nhận trong thời gian này, hệ thống sẽ tự động thực
                  hiện
                </p>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full"
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-2" />
              )}
              Lưu cài đặt
            </Button>
          </>
        )}

        {!enabled && (
          <div className="text-sm text-muted-foreground">
            <p>
              Bật tính năng này để hệ thống tự động kiểm tra và thông báo cho bạn.
            </p>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              variant="outline"
              className="w-full mt-3"
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-2" />
              )}
              Lưu
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AutomationSettings() {
  const [settings, setSettings] = useState<AutomationSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await automationApi.getAllSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading automation settings:', error);
      toast.error('Lỗi khi tải cài đặt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSetting = (updated: AutomationSetting) => {
    setSettings((prev) =>
      prev.map((s) => (s.jobType === updated.jobType ? updated : s))
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Kiểm tra tự động
          </CardTitle>
          <CardDescription>
            Cấu hình hệ thống tự động kiểm tra và thông báo cho bạn. Bạn sẽ nhận được
            thông báo và có thể xác nhận trước khi hệ thống thực hiện hành động.
          </CardDescription>
        </CardHeader>
      </Card>

      {settings.map((setting) => (
        <JobTypeCard
          key={setting.jobType}
          jobType={setting.jobType as 'auto-review-checklist' | 'auto-create-forms'}
          setting={setting}
          onUpdate={handleUpdateSetting}
        />
      ))}
    </div>
  );
}
