import _ from "lodash";
import * as React from "react";
import { useRouteMatch } from "react-router-dom";
import styled from "styled-components";
import { useListAutomations } from "../hooks/automations";
import { useListSources } from "../hooks/sources";
import { FluxObjectKind } from "../lib/api/core/types.pb";
import Alert from "./Alert";
import AutomationsTable from "./AutomationsTable";
import EventsTable from "./EventsTable";
import Flex from "./Flex";
import InfoList, { InfoField } from "./InfoList";
import Link from "./Link";
import LoadingPage from "./LoadingPage";
import PageStatus from "./PageStatus";
import SubRouterTabs, { RouterTab } from "./SubRouterTabs";

type Props = {
  className?: string;
  type: FluxObjectKind;
  name: string;
  namespace: string;
  children?: JSX.Element;
  info: <T>(s: T) => InfoField[];
};

function SourceDetail({ className, name, namespace, info, type }: Props) {
  const { data: sources, isLoading, error } = useListSources();
  const { data: automations } = useListAutomations();
  const { path } = useRouteMatch();

  if (isLoading) {
    return <LoadingPage />;
  }

  const s = _.find(sources, { name, namespace, kind: type });

  if (!s) {
    return (
      <Alert
        severity="error"
        title="Not found"
        message={`Could not find source '${name}'`}
      />
    );
  }

  const items = info(s);

  const isNameRelevant = (expectedName) => {
    return expectedName == name;
  };

  const isRelevant = (expectedType, expectedName) => {
    return expectedType == s.kind && isNameRelevant(expectedName);
  };

  const relevantAutomations = _.filter(automations, (a) => {
    if (!s) {
      return false;
    }

    if (
      type == FluxObjectKind.KindHelmChart &&
      isNameRelevant(a?.helmChart?.name)
    ) {
      return true;
    }

    return (
      isRelevant(a?.sourceRef?.kind, a?.sourceRef?.name) ||
      isRelevant(a?.helmChart?.sourceRef?.kind, a?.helmChart?.sourceRef?.name)
    );
  });

  return (
    <Flex wide tall column className={className}>
      {error && (
        <Alert severity="error" title="Error" message={error.message} />
      )}
      <PageStatus conditions={s.conditions} suspended={s.suspended} />
      <InfoList items={items} />
      <SubRouterTabs rootPath={`${path}/automations`}>
        <RouterTab name="Automations" path={`${path}/automations`}>
          <AutomationsTable automations={relevantAutomations} hideSource />
        </RouterTab>
        <RouterTab name="Events" path={`${path}/events`}>
          <EventsTable
            namespace={s.namespace}
            involvedObject={{
              kind: type,
              name,
              namespace: s.namespace,
            }}
          />
        </RouterTab>
      </SubRouterTabs>
    </Flex>
  );
}

export default styled(SourceDetail).attrs({ className: SourceDetail.name })`
  width: 100%;

  ${InfoList} {
    margin-bottom: ${(props) => props.theme.spacing.medium};
  }

  .MuiTabs-root ${Link} .active-tab {
    background: ${(props) => props.theme.colors.primary}19;
  }
`;
