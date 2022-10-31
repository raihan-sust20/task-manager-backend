import {
  mockInt,
} from '../mocks/mock-values.constants';

export const paginationInput = {
  page: mockInt,
  limit: mockInt,
};

export const paginationMeta = {
  totalItems: mockInt * mockInt,
  itemCount: mockInt * mockInt,
  itemsPerPage: mockInt,
  totalPages: mockInt,
  currentPage: mockInt,
};
