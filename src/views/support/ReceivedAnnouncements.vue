<template><PageContainer><PageHeader title="后台公告" description="阅读平台发给后台管理员的公告" /><AnnouncementReader :api="adminAnnouncements" @changed="changed" /></PageContainer></template>
<script setup>
import PageContainer from '@/components/PageContainer.vue'
import PageHeader from '@/components/PageHeader.vue'
import AnnouncementReader from '@/components/messages/AnnouncementReader.vue'
import { adminAnnouncements } from '@/api/announcements'
function changed() { window.dispatchEvent(new Event('announcements-changed')) }
</script>
