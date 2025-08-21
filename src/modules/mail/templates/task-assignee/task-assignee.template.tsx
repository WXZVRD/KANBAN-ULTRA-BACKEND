import React from 'react';
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
} from '@react-email/components';

interface ITaskAssignedTemplateProps {
  domain: string;
  projectId: string;
  taskId: string;
  taskTitle: string;
}

export function TaskAssignedTemplate({
  domain,
  projectId,
  taskId,
  taskTitle,
}: ITaskAssignedTemplateProps) {
  const taskLink: string = `${domain}/project/${projectId}/task/${taskId}`;

  return (
    <Html>
      <Head />
      <Preview>Вам назначена новая задача: {taskTitle}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto my-10 max-w-xl overflow-hidden rounded-xl shadow-lg border border-gray-200">
            <Section className="bg-gradient-to-r from-blue-600 to-purple-600 py-6 px-8 text-center">
              <Heading className="text-white text-2xl font-bold">
                Новая задача для вас
              </Heading>
              <Text className="text-blue-100 text-sm mt-1">
                Вы были назначены исполнителем задачи
              </Text>
            </Section>

            <Section className="bg-white px-8 py-6 text-center">
              <Text className="text-gray-700 text-base mb-3">
                В проекте появилась новая задача для вас:
              </Text>
              <Container className="bg-gray-50 border border-gray-200 rounded-lg py-4 px-6 mb-6 shadow-sm">
                <Text className="text-lg font-semibold text-gray-900">
                  {taskTitle}
                </Text>
              </Container>
              <Link
                href={taskLink}
                className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md font-semibold"
              >
                Перейти к задаче
              </Link>
            </Section>

            <Section className="bg-gray-50 text-center py-4 px-6 border-t border-gray-200">
              <Text className="text-xs text-gray-500">
                Если вы не ожидаете это письмо — просто проигнорируйте его.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
