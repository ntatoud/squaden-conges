import { Link, Section } from '@react-email/components';

import { styles } from '@/emails/styles';

export const EmailFooter = () => {
  return (
    <Section style={styles.footer}>
      <Link style={styles.link} href="https://bearstudio.fr" target="_blank">
        <strong>BearStudio</strong>
      </Link>
      <br />
    </Section>
  );
};
