import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function UserProfile() {
  // TODO: Implement user authentication and fetch user data
  const user = {
    name: "John Doe",
    interests: ["Music", "Technology", "Food"],
    pastEvents: ["Tech Meetup 2023", "Food Festival"],
    futureEvents: ["Summer Concert 2023"],
  }

  return (
    <Card className="w-64 h-full overflow-y-auto flex flex-col">
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Name</h3>
            <p>{user.name}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Interests</h3>
            <ul className="list-disc list-inside">
              {user.interests.map((interest, index) => (
                <li key={index}>{interest}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Past Events</h3>
            <ul className="list-disc list-inside">
              {user.pastEvents.map((event, index) => (
                <li key={index}>{event}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Future Events</h3>
            <ul className="list-disc list-inside">
              {user.futureEvents.map((event, index) => (
                <li key={index}>{event}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
