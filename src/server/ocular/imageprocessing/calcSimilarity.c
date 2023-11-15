#include <math.h>

double cosineSimilarity(double *A, double *B, int vectorSize)
{
    double dotProduct = 0.0;
    double normA = 0.0;
    double normB = 0.0;
    int i = 0;
    for (i = 0; i < vectorSize; i++)
    {
        dotProduct += A[i] * B[i];
        normA += A[i] * A[i];
        normB += B[i] * B[i];
    }
    return dotProduct / (sqrt(normA) * sqrt(normB));
}

double cosineSimilarityColor(int *A, int *B, int vectorSize)
{
    double dotProduct = 0.0;
    double normA = 0.0;
    double normB = 0.0;
    int i = 0;
    for (i = 0; i < vectorSize; i++)
    {
        dotProduct += (double)A[i] * (double)B[i];
        normA += (double)A[i] * (double)A[i];
        normB += (double)B[i] * (double)B[i];
    }
    return dotProduct / (sqrt(normA) * sqrt(normB));
}