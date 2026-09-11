import { Link } from 'react-router-dom'
import { ArrowLeft, Construction } from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Container,
  Stack,
} from '../components'
import { ROUTES } from '../constants/routes'

function AppFeaturePlaceholderPage({ title, description }) {
  return (
    <Container size="sm">
        <Card className="text-center">
          <CardHeader className="text-center items-center">
            <div className="mb-2 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 shadow-xs">
              <Construction className="w-6 h-6" />
            </div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>

          <CardContent>
            <Stack direction="col" spacing="sm">
              <Link to={ROUTES.HOME} className="w-full">
                <Button
                  variant="ghost"
                  fullWidth
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back to Home
                </Button>
              </Link>
            </Stack>
          </CardContent>
        </Card>
    </Container>
  )
}

export default AppFeaturePlaceholderPage
