import { forwardRef, useState } from "react";
import { ArrowLeftRight, Copy, Crown, LogOut, MoreHorizontal, Play, Shuffle, SlidersHorizontal, UserPlus } from "lucide-react";
import { Spinner } from "../../../components/ui/Spinner";
import { motion } from "framer-motion";
import { toPublicEntityId } from "../../../lib/entity-id";
import { ParticipantIdentityCard } from "../../game/components/overlays/ParticipantIdentity";
import { Button, ButtonLink, IconButton } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/Badge";
import { DropdownMenu } from "../../../components/ui/DropdownMenu";
import AppModalShell from "../../../components/ui/AppModalShell";
import type { PartyRuntimeStatus } from "../controllers/party-controller";
import type { PartySnapshot, PartyTeamId, PartyMode } from "../lib/party-client";
import {
  lobbyTeamLabel,
} from "../lib/lobby-ui";
import type { PartyPanelState } from "../hooks/usePartyPanelState";
import {
  LobbySection,
} from "./lobby-primitives";
import { PartySettings } from "./PartySettings";
import { InviteFriendsModal } from "../../social/components/InviteFriendsModal";

type PartyView = {
  status: PartyRuntimeStatus;
  snapshot: PartySnapshot | null;
  inviteCode: string;
  isOwner: boolean;
  busy: boolean;
  error: string;
};

type PartyPanelProps = {
  inviteCopied: boolean;
  party: PartyView;
  mapPickerOpen: boolean;
  setMapPickerOpen: (open: boolean) => void;
  state: PartyPanelState;
  userId: string;
  leaveParty: () => Promise<void>;
  kickPartyMember: (userId: string) => Promise<void>;
  transferPartyOwner: (userId: string) => Promise<void>;
  startParty: () => Promise<void>;
  switchPartyTeam: (teamId: PartyTeamId) => Promise<void>;
  shufflePartyTeams: () => Promise<void>;
  accessToken?: string;
};

const panelMotion = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -14 },
  transition: { duration: 0.22, ease: "easeOut" },
} as const;

export const PartyPanel = forwardRef<HTMLDivElement, PartyPanelProps>(function PartyPanel({
  inviteCopied,
  kickPartyMember,
  leaveParty,
  party,
  mapPickerOpen,
  setMapPickerOpen,
  startParty,
  state,
  switchPartyTeam,
  shufflePartyTeams,
  transferPartyOwner,
  userId,
  accessToken = "",
}, ref) {
  const [inviteFriendsOpen, setInviteFriendsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const canInviteFriends = !!accessToken && !!party.snapshot?.id;
  const {
    activeMatchId,
    canStart,
    clockOn,
    config,
    copyInvite,
    currentMember,
    matchInProgress,
    members,
    mode,
    pressureOn,
    pressureSeconds,
    roundSeconds,
    saveConfig,
    saveMode,
  } = state;

  return (
    <motion.div
      ref={ref}
      key="party"
      {...panelMotion}
      className="pointer-events-auto relative flex h-auto w-full max-w-[1180px] flex-col gap-4 md:h-full md:min-h-0"
    >
      {inviteFriendsOpen && party.snapshot && accessToken ? (
        <InviteFriendsModal
          accessToken={accessToken}
          partyId={party.snapshot.id}
          memberUserIds={members.map((member) => member.userId)}
          onClose={() => setInviteFriendsOpen(false)}
        />
      ) : null}

      <div className="flex flex-none items-stretch justify-center pt-12 md:min-h-0 md:flex-1">
        <div className="flex w-full max-w-[900px] flex-col md:min-h-0">
            {matchInProgress ? (
              <LobbySection className="mb-4">
                <p className="text-label font-strong text-status-success">
                  Game In Progress
                </p>
                <p className="mt-1 text-body-sm font-semibold text-content-primary">
                  {currentMember?.inActiveMatch
                      ? "You are part of this game and can reconnect whenever you are ready."
                      : "You joined after this game started and will be able to play in the next one."}
                </p>
                {currentMember?.inActiveMatch && activeMatchId ? (
                  <ButtonLink
                    variant="primary"
                    href={`/match/${encodeURIComponent(toPublicEntityId(activeMatchId))}`}
                    size="md"
                    className="mt-3"
                  >
                    <Play size={16} fill="currentColor" />
                    Reconnect to Game
                  </ButtonLink>
                ) : null}
              </LobbySection>
            ) : null}

            {party.snapshot ? (
              <PartyMemberList
                busy={party.busy}
                isOwner={party.isOwner}
                members={members}
                mode={mode}
                snapshot={party.snapshot}
                fadeAtBottom={party.isOwner && party.snapshot.state === "open"}
                switchPartyTeam={switchPartyTeam}
                shufflePartyTeams={shufflePartyTeams}
                transferPartyOwner={transferPartyOwner}
                kickPartyMember={kickPartyMember}
                userId={userId}
              />
            ) : null}
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1040px] shrink-0 gap-3 pt-3">
            {party.snapshot ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setSettingsOpen(true)}
                  className="w-full"
                >
                  <SlidersHorizontal size={16} />
                  Game settings
                </Button>

                {settingsOpen && !mapPickerOpen ? (
                  <AppModalShell
                    title="Game settings"
                    onClose={() => setSettingsOpen(false)}
                    placement="center"
                    maxWidthClassName="max-w-2xl"
                  >
                    <PartySettings
                      accessToken={accessToken}
                      userId={userId}
                      busy={party.busy}
                      clockOn={clockOn}
                      config={config}
                      isOwner={party.isOwner}
                      mode={mode}
                      pressureOn={pressureOn}
                      pressureSeconds={pressureSeconds}
                      roundSeconds={roundSeconds}
                      saveConfig={saveConfig}
                      saveMode={saveMode}
                      setMapPickerOpen={setMapPickerOpen}
                      snapshot={party.snapshot}
                    />
                  </AppModalShell>
                ) : null}
              </>
            ) : null}

            <div className={`grid items-stretch gap-3 ${party.isOwner || party.snapshot?.state !== "open" ? "grid-cols-4" : "grid-cols-3"}`}>
              <div className="flex flex-col justify-center">
                {party.snapshot && !(party.isOwner && matchInProgress) ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void leaveParty()}
                    disabled={party.busy}
                    className="h-full w-full"
                  >
                    <LogOut size={16} />
                    Leave
                  </Button>
                ) : null}
              </div>
              <div className="flex flex-col justify-center">
                {party.inviteCode ? (
                  <Button type="button" variant="secondary" onClick={copyInvite} className="h-full w-full">
                    <Copy className="text-status-success" size={16} />
                    {inviteCopied ? "Copied" : `Copy ${party.inviteCode}`}
                  </Button>
                ) : null}
              </div>
              <div className="flex flex-col justify-center">
                {canInviteFriends ? (
                  <Button type="button" variant="secondary" onClick={() => setInviteFriendsOpen(true)} className="h-full w-full">
                    <UserPlus size={16} />
                    Invite friends
                  </Button>
                ) : null}
              </div>
              <div className={`flex min-w-0 flex-col justify-center ${party.isOwner || party.snapshot?.state !== "open" ? "" : "col-span-full"}`}>
                {party.isOwner && party.snapshot?.state === "open" ? (
                  <Button
                    variant="primary"
                    type="button"
                    onClick={() => void startParty()}
                    disabled={!canStart || party.busy}
                    size="lg"
                    className="h-full min-h-14 w-full text-body"
                  >
                    {party.busy ? <Spinner size="sm" label="Starting match" color="current" /> : <Play size={18} fill="currentColor" />}
                    Start
                  </Button>
                ) : party.snapshot?.state === "open" ? (
                  <p className="text-center text-body-sm font-semibold text-content-secondary">
                    Waiting for the leader to start.
                  </p>
                ) : null}
              </div>
            </div>

      </div>
    </motion.div>
  );
});

function PartyMemberList({
  busy,
  fadeAtBottom,
  isOwner,
  kickPartyMember,
  members,
  mode,
  snapshot,
  switchPartyTeam,
  shufflePartyTeams,
  transferPartyOwner,
  userId,
}: {
  busy: boolean;
  fadeAtBottom: boolean;
  isOwner: boolean;
  kickPartyMember: (userId: string) => Promise<void>;
  members: PartySnapshot["members"];
  mode: PartyMode;
  snapshot: PartySnapshot;
  switchPartyTeam: (teamId: PartyTeamId) => Promise<void>;
  shufflePartyTeams: () => Promise<void>;
  transferPartyOwner: (userId: string) => Promise<void>;
  userId: string;
}) {
  const renderMember = (member: PartySnapshot["members"][number]) => {
    const isLeader = member.userId === snapshot.ownerUserId;
    const presenceStatus = member.presenceStatus || (member.connected ? "online" : "offline");
    const statusOpacity =
      presenceStatus === "offline" ? "opacity-40" : presenceStatus === "away" ? "opacity-70" : "";

    return (
      <div key={member.userId} className={`flex min-w-0 flex-col items-center gap-2 py-2 ${statusOpacity}`}>
        <div className="relative w-full min-w-0">
          <ParticipantIdentityCard
            participant={{
              kind: "player",
              id: member.userId,
              name: member.displayName || member.userId,
              avatarUrl: member.avatarUrl,
              avatarFallback: member.displayName || member.userId,
              isGuest: member.isGuest,
              selectedBadge: member.selectedBadge,
            }}
            size="xl"
            className="min-w-0 gap-2 [&>div]:max-w-full"
            nameClassName="text-body-sm font-strong text-content-primary"
          />
          {isLeader ? (
            <Badge tone="success" className="absolute right-1 top-0 px-1.5 py-1" aria-label={`${member.displayName || member.userId} is the party leader`}>
              <Crown size={12} />
            </Badge>
          ) : isOwner && snapshot.state === "open" && member.userId !== userId ? (
            <div className="absolute right-1 top-0">
              <DropdownMenu
                trigger={
                  <IconButton size="icon-sm" disabled={busy} aria-label={`Actions for ${member.displayName || member.userId}`}>
                    <MoreHorizontal size={16} />
                  </IconButton>
                }
                items={[
                  {
                    label: "Make party leader",
                    onSelect: () => void transferPartyOwner(member.userId),
                    disabled: busy,
                  },
                  {
                    label: "Kick from party",
                    onSelect: () => void kickPartyMember(member.userId),
                    disabled: busy,
                    destructive: true,
                    separatorBefore: true,
                  },
                ]}
              />
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  if (mode === "team_duel") {
    const blueMembers = members.filter((member) => member.teamId === "b");
    const redMembers = members.filter((member) => (member.teamId || "a") === "a");
    const selfTeam = (members.find((member) => member.userId === userId)?.teamId || "a") as PartyTeamId;
    const targetTeam: PartyTeamId = selfTeam === "a" ? "b" : "a";

    const teamColumn = (teamId: PartyTeamId, teamMembers: typeof members) => (
      <div className="flex min-h-0 min-w-0 w-full max-w-[600px] flex-col gap-5 md:mx-0 md:max-w-none">
        <Badge tone={teamId === "b" ? "info" : "danger"} size="md" className="self-center">{lobbyTeamLabel(teamId)}</Badge>
        <div className={`party-profile-grid party-profile-grid-teams flex max-h-[34vh] flex-wrap content-start justify-center gap-x-3 gap-y-5 overflow-y-auto md:max-h-none md:min-h-0 md:flex-1 ${fadeAtBottom ? "party-player-list-fade pb-8" : ""}`}>
          {teamMembers.length ? teamMembers.map(renderMember) : (
            <p className="w-full py-4 text-center text-body-sm font-semibold text-content-secondary">No players yet</p>
          )}
        </div>
      </div>
    );

    return (
      <div className="party-team-grid grid items-stretch justify-center gap-3 md:min-h-0 md:flex-1">
        {teamColumn("b", blueMembers)}
        <div className="flex flex-col items-center justify-center gap-2 self-center">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={busy || snapshot.state !== "open"}
            onClick={() => void switchPartyTeam(targetTeam)}
            className="whitespace-nowrap rounded-full px-4"
          >
            <ArrowLeftRight size={16} />
            Switch teams
          </Button>
          {isOwner ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={busy || snapshot.state !== "open"}
              onClick={() => void shufflePartyTeams()}
              className="whitespace-nowrap rounded-full px-4"
            >
              <Shuffle size={16} />
              Shuffle
            </Button>
          ) : null}
        </div>
        {teamColumn("a", redMembers)}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-none flex-col gap-5 md:min-h-0 md:flex-1">
      <Badge size="md" className="self-center">Players</Badge>
      <div className={`party-profile-grid party-profile-grid-players flex max-h-[45vh] flex-wrap content-start justify-center gap-x-4 gap-y-5 overflow-y-auto md:max-h-none md:min-h-0 md:flex-1 ${fadeAtBottom ? "party-player-list-fade pb-8" : ""}`}>
        {members.map(renderMember)}
      </div>
    </div>
  );
}
