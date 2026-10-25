import { test } from 'node:test'
import assert from 'node:assert/strict'
import { countBooked, isValidDate, rangesOverlap } from '../src/utils/availability.js'

test('ranges that share a day overlap', () => {
  assert.equal(rangesOverlap('2026-11-01', '2026-11-05', '2026-11-05', '2026-11-08'), true)
})

test('a range inside another range overlaps', () => {
  assert.equal(rangesOverlap('2026-11-01', '2026-11-10', '2026-11-03', '2026-11-04'), true)
})

test('ranges that do not touch do not overlap', () => {
  assert.equal(rangesOverlap('2026-11-01', '2026-11-04', '2026-11-05', '2026-11-08'), false)
  assert.equal(rangesOverlap('2026-11-10', '2026-11-12', '2026-11-01', '2026-11-09'), false)
})

test('only bookings of the same item are counted', () => {
  const bookings = [
    { equipment_id: 1, collect_date: '2026-11-02', return_date: '2026-11-06', status: 'approved' },
    { equipment_id: 1, collect_date: '2026-11-20', return_date: '2026-11-22', status: 'pending' },
    { equipment_id: 2, collect_date: '2026-11-02', return_date: '2026-11-06', status: 'approved' },
  ]
  assert.equal(countBooked(bookings, 1, '2026-11-05', '2026-11-07', '2026-10-26'), 1)
  assert.equal(countBooked(bookings, 1, '2026-11-01', '2026-11-30', '2026-10-26'), 2)
  assert.equal(countBooked(bookings, 2, '2026-11-10', '2026-11-12', '2026-10-26'), 0)
})

test('a late item that is still out blocks every date until it comes back', () => {
  const bookings = [
    { equipment_id: 3, collect_date: '2026-10-01', return_date: '2026-10-08', status: 'issued' },
  ]
  // it was due on the 8th, today is the 26th and it has not been returned
  assert.equal(countBooked(bookings, 3, '2026-10-26', '2026-10-26', '2026-10-26'), 1)
  assert.equal(countBooked(bookings, 3, '2026-11-15', '2026-11-16', '2026-10-26'), 1)
})

test('date format check', () => {
  assert.equal(isValidDate('2026-11-05'), true)
  assert.equal(isValidDate('2026-02-30'), false)
  assert.equal(isValidDate('05-11-2026'), false)
  assert.equal(isValidDate(''), false)
})
