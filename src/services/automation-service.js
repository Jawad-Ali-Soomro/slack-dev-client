import axios from "../lib/axios";

const automationService = {
  getAutomations: async () => {
    const response = await axios.get("/api/automations");
    return response.data;
  },

  toggleAutomation: async (key, enabled) => {
    const response = await axios.patch(`/api/automations/${key}`, { enabled });
    return response.data;
  },

  suggestAssignee: async ({
    title = "",
    description = "",
    teamId,
    jobRole,
  } = {}) => {
    const response = await axios.post("/api/automations/suggest-assignee", {
      title,
      description,
      teamId: teamId && teamId !== "none" ? teamId : undefined,
      jobRole: jobRole && jobRole !== "none" ? jobRole : undefined,
    });
    return response.data;
  },
};

export default automationService;
