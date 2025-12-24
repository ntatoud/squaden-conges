import { Container, Heading, Section, Text } from '@react-email/components';
import dayjs from 'dayjs';

import { EmailFooter } from '@/emails/components/email-footer';
import { EmailLayout } from '@/emails/components/email-layout';
import { styles } from '@/emails/styles';
import { LEAVE_TYPES, TIME_SLOTS } from '@/features/leave/constants';
import type { Leave } from '@/features/leave/schema';
import { DateRangeDisplay, DISPLAY_DATE_FORMAT } from '@/utils/dates';

type LeaveDecision = 'approved' | 'refused';

export const TemplateLeaveDecision = (
  props: Leave & {
    requesterName: string;
    decision: LeaveDecision;
    decisionReason?: string; // useful especially for refusal, optional for approval
  }
) => {
  const {
    requesterName,
    decision,
    type,
    fromDate,
    toDate,
    timeSlot,
    projects,
    projectDeadlines,
    statusReason,
  } = props;

  const leaveTypeLabel = LEAVE_TYPES.find((t) => t.id === type)?.label ?? type;

  const startDate = dayjs(fromDate).format(DISPLAY_DATE_FORMAT);
  const endDate = dayjs(toDate).format(DISPLAY_DATE_FORMAT);

  const rawDays = dayjs(toDate).diff(dayjs(fromDate), 'day');
  const isSameDay = rawDays === 0;

  const durationDays =
    isSameDay && timeSlot === 'full-day' ? 1 : Math.max(rawDays, 0);

  const timeSlotLabel =
    TIME_SLOTS.find((t) => t.id === timeSlot)?.label ?? timeSlot ?? '';

  const projectsLine =
    Array.isArray(projects) && projects.length > 0
      ? projects.join(', ')
      : projects;

  const isApproved = decision === 'approved';

  const title = isApproved ? 'Congés validés' : 'Congés refusés';
  const preview = isApproved
    ? `Votre demande de congés a été validée (${leaveTypeLabel})`
    : `Votre demande de congés a été refusée (${leaveTypeLabel})`;

  const intro = isApproved
    ? `Votre demande de congés a été validée.`
    : `Votre demande de congés a été refusée.`;

  console.log(projects);
  console.log(projectsLine);
  console.log('test');
  return (
    <EmailLayout preview={preview} language="fr">
      <Container style={styles.container}>
        <Heading style={styles.h1}>{title}</Heading>

        <Section style={styles.section}>
          <Text style={styles.text}>Bonjour {requesterName},</Text>

          <Text style={styles.text}>{intro}</Text>

          <Text style={styles.text}>
            <strong>Type :</strong> {leaveTypeLabel}
            <br />
            <strong>Période :</strong>{' '}
            <DateRangeDisplay fromDate={fromDate} toDate={toDate} />
            <br />
            <strong>Durée :</strong>{' '}
            {durationDays === 0
              ? // eslint-disable-next-line sonarjs/no-nested-conditional
                timeSlot === 'full-day'
                ? 1
                : 0.5
              : durationDays}{' '}
            jour
            {durationDays !== 1 ? 's' : ''}
            {timeSlotLabel ? (
              <>
                <span style={styles.textMuted}>({timeSlotLabel})</span>
              </>
            ) : null}
          </Text>

          {projectsLine ? (
            <Text style={styles.text}>
              <strong>Projets concernés :</strong> {projectsLine}
            </Text>
          ) : null}

          {projectDeadlines ? (
            <Text style={styles.text}>
              <strong>Échéances / continuité :</strong> {projectDeadlines}
            </Text>
          ) : null}

          {statusReason ? (
            <Text style={styles.textMuted}>
              <strong>Commentaire (demande) :</strong> {statusReason}
            </Text>
          ) : null}
        </Section>

        <EmailFooter />
      </Container>
    </EmailLayout>
  );
};

export default TemplateLeaveDecision;
