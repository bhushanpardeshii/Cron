"use client"
import React, { useState } from 'react';
import { Cron } from 'croner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CronConverter: React.FC = () => {
  const [cronExpression, setCronExpression] = useState<string>('');
  const [nextExecution, setNextExecution] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<string>('');
  const [error, setError] = useState<string>('');

  const convertCronToNextExecution = () => {
    try {

      const trimmedExpression = cronExpression.trim();
      if (!trimmedExpression) {
        setError('Please enter a cron expression');
        return;
      }

      const job = new Cron(trimmedExpression);

      const next = job.nextRun(); //for next execution time

      if (!next) {
        throw new Error('Unable to calculate next run');
      }


      const formattedNext = next.toLocaleString('en-US', {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dateStyle: 'full',
        timeStyle: 'long'
      });

      const frequencyDescription = generateFrequencyDescription(trimmedExpression);

      setNextExecution(formattedNext);
      setFrequency(frequencyDescription);
      setError('');
    } catch (err) {
      setError('Invalid cron expression');
      setNextExecution(null);
      setFrequency('');
    }
  };

  // Generate human-readable frequency description
  const generateFrequencyDescription = (expression: string): string => {

    const parts = expression.split(/\s+/);

    if (parts.length < 5 || parts.length > 6) {
      return 'Unable to describe frequency';
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] =
      parts.length === 6 ? parts.slice(1) : parts;

    const desc: string[] = [];
    const dayNames: string[] = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday',
      'Thursday', 'Friday', 'Saturday'
    ];

    // Minutes description
    if (minute === '*') desc.push('Every minute');
    else if (minute.includes(',')) desc.push(`At minute(s) ${minute}`);
    else if (minute.includes('/')) desc.push(`Every ${minute.split('/')[1]} minute(s)`);
    else desc.push(`At minute ${minute}`);

    // Hours description
    if (hour === '*') desc.push('of every hour');
    else if (hour.includes(',')) desc.push(`at ${hour}:00`);
    else if (hour.includes('/')) desc.push(`every ${hour.split('/')[1]} hour(s)`);
    else desc.push(`at ${hour}:00`);

    // Day of month description
    if (dayOfMonth === '*') desc.push('every day');
    else if (dayOfMonth.includes(',')) desc.push(`on days ${dayOfMonth}`);
    else desc.push(`on day ${dayOfMonth}`);

    // Month description
    if (month === '*') desc.push('of every month');
    else if (month.includes(',')) desc.push(`in months ${month}`);
    else desc.push(`in month ${month}`);

    // Day of week description
    if (dayOfWeek !== '*') {
      const weekDays = dayOfWeek.split(',').map(day => {
        const num = parseInt(day);
        return !isNaN(num) ? dayNames[num] : day;
      });
      desc.push(`on ${weekDays.join(', ')}`);
    }

    return desc.join(' ');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Cron Expression Next Execution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="cron-input">Cron Expression</Label>
            <Input
              id="cron-input"
              value={cronExpression}
              onChange={(e) => setCronExpression(e.target.value)}
              placeholder="Enter cron expression (e.g., * * * * *)"
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: minute hour day-of-month month day-of-week
            </p>
          </div>

          <Button
            onClick={convertCronToNextExecution}
            className="w-full"
          >
            Find Next Execution
          </Button>

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          {nextExecution && (
            <div className="space-y-2">
              <div>
                <Label>Frequency</Label>
                <div className="mt-1 p-2 bg-gray-100 rounded text-sm">
                  {frequency}
                </div>
              </div>

              <div>
                <Label>Next Execution</Label>
                <div className="mt-1 p-3 bg-gray-100 rounded">
                  {nextExecution}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Time Zone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-600">
          <h3 className="font-semibold mb-2">Cron Expression Examples:</h3>
          <ul className="list-disc list-inside">
            <li>* * * * * - Every minute</li>
            <li>0 * * * * - Every hour</li>
            <li>0 0 * * * - Every day at midnight</li>
            <li>0 0 1 * * - First day of every month</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CronConverter;