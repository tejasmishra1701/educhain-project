interface OpenCampusProfile {
  username: string;
  openCampusId: string;
  name: string;
}

export const openCampusService = {
  async getLinkedProfile(
    walletAddress: string
  ): Promise<OpenCampusProfile | null> {
    try {
      const response = await fetch(
        `https://api.opencampus.edu/profile/${walletAddress}`
      );
      if (!response.ok) throw new Error("Profile not found");
      return response.json();
    } catch (error) {
      console.error("Failed to fetch OpenCampus profile:", error);
      return null;
    }
  },
};
