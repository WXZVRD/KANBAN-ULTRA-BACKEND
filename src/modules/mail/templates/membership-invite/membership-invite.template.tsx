import React from "react";
import {
  Html,
  Head,
  Preview,
  Tailwind,
  Body,
  Container,
  Heading,
  Text,
  Link,
  Section,
} from "@react-email/components";
import { MemberRole } from "../../../project/membership/types/member-role.enum";

interface IMembershipInviteTemplateProps {
  domain: string;
  token: string;
  projectId: string;
  memberRole: MemberRole;
}

export function MembershipInviteTemplate({
  domain,
  token,
  projectId,
  memberRole,
}: IMembershipInviteTemplateProps): any {
  const confirmLink: string = `${domain}/project/${projectId}?role=${memberRole}&token=${token}`;

  return (
    <Html>
      <Head />
      <Preview>Приглашение для участия в проекте!</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white mx-auto my-10 p-8 rounded-md shadow-md max-w-xl">
            <Heading className="text-2xl font-bold text-center text-gray-800 mb-6">
              Примите приглашение в участие
            </Heading>

            <Text className="text-gray-700 mb-4">
              Привет! Чтобы участваовать в проекте, пожалуйста, перейдите по
              следующей ссылке:
            </Text>

            <Section className="text-center mb-6">
              <Link
                href={confirmLink}
                className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md font-semibold"
              >
                Принять приглашение
              </Link>
            </Section>

            <Text className="text-sm text-gray-600 mb-2">
              Эта ссылка действительна в течение 1 часа. Если вы не запрашивали
              подтверждение, просто проигнорируйте это сообщение.
            </Text>

            <Text className="text-sm text-gray-600">
              Спасибо за использование нашего сервиса!
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
