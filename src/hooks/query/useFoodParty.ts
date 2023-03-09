import { useToast } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import {
  createFoodParty,
  fetchFoodPartyDetail,
  fetchFoodPartyList,
  fetchFoodPartyReviewees,
  fetchMyFoodPartyList,
  postFoodPartyLeaderReview,
  postFoodPartyMemberReview,
} from 'services/foodParty';
import { FoodPartyLeaderReviewBody, FoodPartyMemberReviewBody } from 'types/foodParty';
import QUERY_KEYS from 'utils/constants/queryKeys';
import ROUTING_PATHS from 'utils/constants/routingPaths';

import { updateFoodPartyStatus } from './../../services/foodParty';

export const useGetMyFoodPartyList = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.FOOD_PARTY.MY_FOOD_PARTY_LIST],
    queryFn: () => fetchMyFoodPartyList(),
  });
};

export const useGetFoodPartyDetail = (partyId: string, userId?: number) => {
  const result = useQuery({
    queryKey: [QUERY_KEYS.FOOD_PARTY.FOOD_PARTY_DETAIL, partyId],
    queryFn: () => fetchFoodPartyDetail(partyId),
  });
  const isLeader = !!result.data?.members.find(
    ({ userId: memberUserId, crewMemberRole }) =>
      memberUserId === userId && crewMemberRole === 'LEADER'
  );
  const isMember = !!result.data?.members.find(
    ({ userId: memberUserId, crewMemberRole }) =>
      memberUserId === userId && crewMemberRole === 'MEMBER'
  );
  const isFull = result.data?.currentMember === result.data?.capacity;

  return {
    ...result,
    isLeader,
    isMember,
    isFull,
  };
};

export const useGetSearchedFoodPartyList = (placeId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FOOD_PARTY.SEARCHED_FOOD_PARTY_LIST, placeId],
    queryFn: () => fetchFoodPartyList(placeId),
  });
};

export const useGetFoodPartyReviewees = (crewId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FOOD_PARTY.FOOD_PARTY_REVIEWEES, crewId],
    queryFn: () => fetchFoodPartyReviewees(crewId),
  });
};

export const usePostLeaderReview = (crewId: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ crewId, body }: { crewId: string; body: FoodPartyLeaderReviewBody }) =>
      postFoodPartyLeaderReview(crewId, body),
    onSuccess: () => {
      toast({
        title: '방장 리뷰가 작성되었습니다',
        description: '작성해주셔서 감사합니다',
        position: 'bottom',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      queryClient.invalidateQueries([QUERY_KEYS.FOOD_PARTY.FOOD_PARTY_REVIEWEES, crewId]);
    },
  });
};

export const useCreateFoodParty = () => {
  const router = useRouter();
  const toast = useToast();

  return useMutation({
    mutationFn: createFoodParty,
    onSuccess: (data) => {
      const partyId = data.id;
      router.push(ROUTING_PATHS.FOOD_PARTY.DETAIL(partyId));
      toast({
        title: '밥모임이 생성되었습니다!',
        description: '생성된 밥모임 정보를 확인하세요',
        position: 'top',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    },
  });
};

export const usePostMemberReview = (crewId: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ crewId, body }: { crewId: string; body: FoodPartyMemberReviewBody }) =>
      postFoodPartyMemberReview(crewId, body),
    onSuccess: () => {
      toast({
        title: '멤버 리뷰가 작성되었습니다',
        description: '작성해주셔서 감사합니다',
        position: 'bottom',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      queryClient.invalidateQueries([QUERY_KEYS.FOOD_PARTY.FOOD_PARTY_REVIEWEES, crewId]);
    },
  });
};

export const useUpdateFoodPartyStatus = (partyId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: string) => updateFoodPartyStatus(partyId, status),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.FOOD_PARTY.FOOD_PARTY_DETAIL, partyId]);
    },
    onError: (error: unknown) => {
      // To Do: 배포 전에 지우기 by 승준
      console.error(error);
    },
  });
};
